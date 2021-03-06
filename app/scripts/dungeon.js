var dungeon = {
    metaListeners: [],
    meta: {
        event: function(type, options) {if(this.debug){console.log(type)};_.where(dungeon.metaListeners,{type:type}).forEach(function(a){a(options);})},
        listen: function(type, callback) {dungeon.metaListenes.push({type: type,callback: callback})},
        debug:false,
    },
    inventory:function(){
        var inventory = {
            contents:[],
            add:function(item){this.contents.push(item)},
            has:function(item){
                return _.includes(this.contents,item);
            },
            remove:function(item,count){
                _.pullAt(this.contents.indexOf(item));
                return item;
            }
        };
        return inventory;
    },
    wallet:function(){
        return {
            gold:0,
            add:function(n){this.gold+=n},
            remove:function(n){this.gold-=n},
            has:function(n){this.gold>=n}
        }
    },
    group:{
        proto:[{group:'proto',p:3},{name:'ε',p:5}],
        add:function(name,group){dungeon.groups[name]=group},
        roll:function(group){    
            var attempts = 1000;
            var result = this.select(group);
            while(result.group&&attempts){
                attempts--;
                var group = dungeon.group[result.group];
                result = this.select(group);
            }
            return result.name;
        },
        select:function(array){
            var total = 0;
            var ranges = array.map(function(a,index){
                var range = {
                    start:total,
                    end:a.p+total,
                    item:a
                }
                total+=a.p;
                return range;
            });
            var roll = Math.floor(Math.random()*total);
            var winner = _.find(ranges,function(a){return a.start<=roll&&a.end>=roll});
            var item = winner.item;
            return item;
        }
    },
   items:{
        proto:{
            onAction:function(){},
            use:function(){}
        },
        create:function(item){
            return _.defaults(dungeon.items[item](),this.proto);
        },
        add:function(name, item) {
            this[name] = function(){
                return item;   
            }
            return this;
        }
   },
   random:{
        d20:function(){return Math.ceil(Math.random()*20)},
        d12:function(){return Math.ceil(Math.random()*12)},
        d10:function(){return Math.ceil(Math.random()*10)},
        d8:function(){return Math.ceil(Math.random()*8)},
        d5:function(){return Math.ceil(Math.random()*5)},
        d6:function(){return Math.ceil(Math.random()*6)},
        coin:function(){return Math.random() > 0.5},
    },
    battle:function(characters){
    	return {
            characters:characters,
            add:function(char){charactars.push(char)},
    		step:function(){
    			actors.forEach(function actorMove(actor) {
                    var move = this.getMove(actor);
                    actor.action(move.action,move.targets);
                });
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
    characters:{
        extensions:{},
        extend:function(name,extension){
            dungeon.characters.extensions[name] = extension;
        }, 
        add: function(name, schema) {
            this[name] = function(overrides){return _.defaults({},schema,overrides);} 
            return this;
        },
        create:   function(config) {
            var spawn = dungeon.characters.proto();
            _.assign(spawn,config);
            return spawn;
        },
        proto: function() {
            var proto = {
                name: 'unknown',
                hp: 1,
                max_hp: 1,
                team: 0,
                status: {},
                properties: {},
                immune:{},
                dead:false,
                stepListeners: [],
                equipment: [],
                actionListeners: [],
                actions: ['defend'],
                action: function(name, targets) {
                    this.actionListeners.forEach(function(a) {a(this)}.bind(this));
                    _.each(this.status,function(a){if(a&&a.onAction){a.onAction(this)}}.bind(this));
                    _.each(this.equipment,function(a){if(a&&a.onAction){a.onAction(this)}}.bind(this));
                    var action = dungeon.actions[name];
                    if (action.onAction) action.onAction.bind(this)(targets);
                    dungeon.meta.event("action", {actor: this, name: name, targets: targets});
                    return this;
                },
                equip:function(item){
                    this.equipment.push(item);
                    dungeon.meta.event("equip",{target: this,item: item});
                    return this;
                },
                unequip:function(item){
                    this.equipment.splice(this.equipment.indexOf(item),1);
                    dungeon.meta.event("unequip",{target: this,item: item});
                    return this;
                },
                takeDamage: function(damage) {
                    this.hp -= damage;
                    dungeon.meta.event("takeDamage",{target: this,damage: damage});
                    if (this.hp<=0){
                        this.die();
                    }
                    return this;
                },
                die: function(){
                    this.dead = true;
                    this.hp = 0;
                    dungeon.meta.event("dead",{target: this});
                    return this;
                },
                recoverHP: function(hp) {
                    this.hp += hp;
                    if (this.hp > this.max_hp) this.hp = this.max_hp;
                    dungeon.meta.event("recoverHP", {target: this,hp: hp});
                    return this;
                },
                restore:function(){
                    this.hp=this.max_hp;
                    this.dead = false;
                    dungeon.meta.event("restored",{target: this});
                    return this;
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
    ais:{
        proto:function(field){},
        add:function(name, ai) {this.ais[name] = ai; return this;}
    },
    elements:{
        proto:{proto:1},
        add:function(name,element){ dungeon.elements[name] = element;}
    },
    calculate: {
        damage_1: function(attack,defense) {return attack - defense/2},
        hit_1: function(hit,evade,modifier) {return hit / evade * modifier},
        level: function(experience,mod) {return Math.ceil(1 * Math.sqrt(experience / mod));},
        elemental: function(element,resistance) {
            return dungeon.elements[element][resistance];
        },
        add:function(name,functor){
            dungeon.calculate[name] = functor;
        }
    },
    actions: {
        proto:{onAction:function(){}},
        add:function(name, action) { this.actions[name] = action; return this;  }
    },
    statuses: {
        proto:{onAction:function(){}},
        add:function(name, status) { this.statuses[name] = status; return this;  }
    },

};
