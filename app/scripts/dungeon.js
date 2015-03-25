var dungeon = {
	elements:{
		fire:{
			multipliers:{
				ice:1.5,
				water:0.5
			}
		}
	},
	stats:'max_hp.max_mp.attack.defense.special.resist.speed.evade.accuracy.max_ap'.split('.'),
	calculate:{
		damage:function(attack,defender){
			var d = dungeon.calculate.stats(defender);
			return attack.damage - d.defense / 10;
		},
		stats:function(entity){
			var calculated = {};
			var level = dungeon.calculate.level(entity)
			for (key in entity.stats){
				calculated[key] =  entity.stats[key] * entity.formulas[key] || Math.pow(level,1.2);
			}

			delete calculated.calculate;

			return calculated;
		},
		level:function(entity){
			return Math.ceil(1 * Math.sqrt(entity.experience/1000));
		}
	},
	actions:{
		attack:function(options){
			var stats = dungeon.calculate.stats(this);
			options.target.takeDamage({
				damage:stats.attack,
				element:options.element
			});
		},
		defend:function(){

		}
	},
	/*
		Add a new action that entities can do.
	*/
	action:function(name,action){
		this.actions[name] = action;
	},

	/*
		Creates a blueprint that returns new instances of a creature.
	*/
	entity:function(config){
		config = config || {};

		var stats = dungeon.stats,
			actions = config.actions || ['attack','defend'];

		var entity = function(ghost){
			ghost = ghost || {};
			ghost.stats = ghost.stats || {};
			var spawn = {
				stats:{
					calculate:function(){
						return dungeon.calculate.stats(spawn);
					}
				},
				formulas: {

				},
				experience:ghost.experience||1,
				hp:10,
				mp:1,
				ap:0,
				actions:ghost.actions|| actions,
				action:function(name,options){
					var action = dungeon.actions[name];
					action.bind(this)(options);
				},
				takeDamage:function(attack){
					var damage = dungeon.calculate.damage(attack,this);
					this.hp-=damage;
				}
			}

			stats.forEach(function(s){spawn.stats[s] = ghost.stats[s] || 1});
			return spawn;
		};

		return entity;
	}
};