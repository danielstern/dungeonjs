var dungeon = {
    MAX_ATB: 255,
    metaListeners: [],
    filters:{
        add:function(name,filter){
            dungeon.filters[name] = filter;
        }
    },
    meta: {
        event: function(type, options) {console.log(type);_.where(dungeon.metaListeners,{type:type}).forEach(function(a){a(options);})},
        listen: function(type, callback) {dungeon.metaListenes.push({type: type,callback: callback})}
    },
    inventory:function(){
        var inventory = {
            contents:[],
            add:function(item){this.contents.push(item)},
            use:function(item,targets){
                var instance = dungeon.items.instance(item);

                if (!this.has(item)) return dungeon.meta.event("item_not_in_inventory");
                if (!instance.use){ return dungeon.meta.event("cant_use_item")};

                instance.use(targets);
                if (!item.unlimited) this.remove(item);
               
            },
            has:function(item){
                return _.includes(this.contents,item);
            },
            remove:function(item){
                _.pull(this.contents,item);
            },
            unequip:function(target,position){
                var item = target.equipment[position];
                if (item) {
                    var instance = dungeon.items.instance(item);
                    if (instance.onUnequip) instance.onUnequip(target);
                    this.contents.push(position);
                }
            },
            equip:function(item,target){
                var instance = dungeon.items.instance(item);
                if (!this.has(item)) return dungeon.meta.event("item_not_in_inventory");
                if (!instance.equip) return dungeon.meta.event("cant_use_equip");

                this.unequip(target,instance.equip)
                
                target.equipment[instance.equip] = item;
                if (instance.onEquip) instance.onEquip(target);
                
                this.remove(item);
            }
        };
        return inventory;
    },
   items:{
        instance:function(item){
            return dungeon.items[item]();
        }
   },
   item: function(name, item) {
        this.items[name] = function(){
            return item;   
        }
        return this;
    },
    random:{
        d20:function(){return Math.ceil(Math.random()*20)},
        d10:function(){return Math.ceil(Math.random()*20)},
        d6:function(){return Math.ceil(Math.random()*20)},
        coin:function(){return Math.random() > 0.5},
    },
    battle:function(actors){
    	return {
    		step:function(){
                function actorMove(actor) {
                    if (actor.dead) return;
                    actor.step();
                    if(actor.atb>=255 && actor.auto){
                        var move = this.getMove(actor);
                        actor.action(move.action,move.targets);
                    }
                };
    			actors.forEach(actorMove);
    		},
            getMove:function(actor){
                return dungeon.ais[actor.ai].bind(actor)(actors);
            },
    		getTargets:function(actor,action){
    			return actors.filter(dungeon.targetings[action](actor));
    		},
            action:function(entity,action,targets,all){
                if (!targets) targets = this.getTargets(entity,action);
                if (!all)  targets=targets.slice(0,1);
                entity.action(action,targets);
            }
    	}
    },
    targetings:{},
    targeting: function(name, targeting) {
        this.targetings[name] = targeting;
        return this;
    },
    characters:{
        extensions:{},
        extend:function(name,extension){
            dungeon.characters.extensions[name] = extension;
        },
        actionListeners: [],
        onaction: function(l) {this.actionListeners.push(l);},
        proto: function() {
            var proto = {
            status: {},
            experience: 0,
            hp: 1,
            max_hp: 1,
            name: 'unknown',
            mp: 1,
            atb: 0,
            dead: false,
            team: 0,
            attack: 1,
            defense: 1,
            special: 1,
            resist: 1,
            evasion: 1,
            accuracy: 1,
            speed: 1,
            luck: 1,
            x:0,
            y:0,
            z:0,
            density:1,
            ai: 'none',
            equipment:{},
            damage2x: [],
            damage50: [],
            immune: [],
            stepListeners: [],
            damage0: [],
            properties: [],
            actions: ['defend'],
            action: function(name, targets) {
                var action = dungeon.actions[name];
                var entity = this;

                for (var k in this.status) {
                    if (this.status[k]) {
                        var status = dungeon.statuses[k];
                        if (status.replaceAction) action = dungeon.actions[status.replaceAction];
                        if (status.beforeAction) status.beforeAction(this);
                    }
                }

                for (var q in this.equipment) {
                    if (this.equipment[q]) {
                        var equipment = dungeon.items.instance(this.equipment[q]);
                        if (_.includes(equipment.replaceActionOn,action)) action = dungeon.actions[equipment.replaceAction];
                        if (equipment.beforeAction) equipment.beforeAction(this);
                    }
                }

                targets.forEach(function(target){action.bind(entity)(target)});
                this.atb = 0;

                dungeon.characters.actionListeners.forEach(function(a) {a(this)}.bind(this));
                dungeon.meta.event("action", {actor: this, name: name, targets: targets});
            },
            takeDamage: function(damage) {
                this.hp -= damage;
                dungeon.meta.event("takeDamage",{target: this,damage: damage});
            },
            recoverHP: function(hp) {
                this.hp += hp;
                if (this.hp > this.max_hp) this.hp = this.max_hp;
                dungeon.meta.event("recoverHP", {target: this,hp: hp});
            },
            fullHeal: function() {
                this.hp = this.max_hp;
                this.mp = this.max_mp;
                this.dead = false;
                for (s in this.status) {this.status[s] = false}
            },
            takeStatus: function(status) {
                if (!_.includes(this.immune,status)) this.status[status] = true; 
                dungeon.meta.event("statusInflicted", {target: this,immune: _.includes(this.immune,status)});
            },
            step: function() {
                if (this.atb < dungeon.MAX_ATB) this.atb += dungeon.calculate.atb(this);

                if (this.hp <= 0 && !this.dead) {
                    this.dead = true;
                    dungeon.meta.event("dead", {target: this});
                }

                this.stepListeners.forEach(function(a) {a(this)}.bind(this));
                // dungeon.meta.event("step", {target: this});
            },
            onstep: function(l) {this.stepListeners.push(l);},
            
        };
        _.extend(proto,dungeon.characters.extensions);
        return proto;
        }
    },
    character: function(name, schema) {
        this.characters[name] = function(overrides){return _.defaults({},schema,overrides);} 
        return this;
    },
    ais:{},
    ai: function(name, ai) {this.ais[name] = ai; return this; },
    calculate: {
        physicalDamage: function(target, damage) {
            if (target.defending) damage *= 0.7;
            return damage - target.defense / 10;
        },
        specialDamage: function(target, damage) { return damage - target.resist / 8;},
        level: function(entity) {return Math.ceil(1 * Math.sqrt(entity.experience / 250));},
        hit: function(attacker, defender, accuracy) {return Math.random() > attacker.accuracy / defender.evasion / 2},
        elemental: function(target, damage, element) {
            if (_.includes(target.damage2x,element)) damage *= 2;
            if (_.includes(target.damage50,element)) damage /= 2;
            if (_.includes(target.damage0,element)) damage *= 0;
            return damage;
        },
        atb: function(char) {
            var increase = char.speed;
            if (char.haste) increase *= 2;
            if (char.slow) increase /= 2;
            return increase;
        },
        extend:function(name,functor){
            dungeon.calculate[name] = functor;
        }
    },
    actions: {},
    /*
		Add a new action that entities can do.
	*/
    action: function(name, action) {
        this.actions[name] = action;
        return this;
    },
    statuses: {},
    status: function(name, status) {
        this.statuses[name] = status;
        return this;
    },

    /*
		Creates a blueprint that returns new instances of a creature.
	*/
    entity: function(config) {
        var spawn = dungeon.characters.proto();
        _.assign(spawn,config).fullHeal();
        return spawn;
    }
};
