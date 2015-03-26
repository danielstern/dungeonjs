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
        proto: function() {
            var proto = {
            name: 'unknown',
            experience: 0,
            hp: 1,
            max_hp: 1,
            atb: 0,
            team: 0,
            attack: 1,
            defense: 1,
            status: {},
            properties: {},
            immune:{},
            stepListeners: [],
            actionListeners: [],
            actions: ['defend'],
            action: function(name, targets) {
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
            },
            onstep: function(l) {this.stepListeners.push(l);},
            onaction: function(l) {this.actionListeners.push(l);},
            
        };
            _.extend(proto,dungeon.characters.extensions);
            return proto;
        }
    },
    character: function(name, schema) {
        this.characters[name] = function(overrides){return _.defaults({},schema,overrides);} 
        return this;
    },
    ais:{
        add:function(name, ai) {this.ais[name] = ai; return this; }
    },
    elements:{
        add:function(name,element){ dungeon.elements[name] = element;}
    },
    calculate: {
        damage_1: function(attack,defense) {return attack - defense/2},
        level: function(experience,const) {return Math.ceil(1 * Math.sqrt(experience / const));},
        hit: function(hit,evade,modifier) {return hit / evade * modifier},
        elemental: function(element,resistance) {
            return dungeon.elements[element][resistance];
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
        _.assign(spawn,config);
        return spawn;
    }
};
