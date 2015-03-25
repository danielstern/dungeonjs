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
			var level = dungeon.calculate.level(entity);
			for (key in entity.stats){
				calculated[key] =  entity.stats[key] * level;
			}
			return calculated;
		},
		level:function(entity){
			return Math.ceil(1 * Math.sqrt(entity.experience/1000));
		}
	},
	actions:{
		fire_attack_1:function(target){
			var stats = dungeon.calculate.stats(this);
			var element = 'fire';

			var damage = stats.attack + 5;
			
			if (target.damage2x.indexOf(element) > -1) {
				damage *=2;
			}

			if (target.damage50.indexOf(element) > -1) {
				damage /= 2;
			}

			if (target.damage0.indexOf(element) > -1) {
				damage *= 0;
			}

			damage -= target.stats.defense / 10;

			if (Math.random() > 0.2) {
				target.status.burn = true;
			}

			target.hp -= damage;
			console.log("Fire attack:",this.name, '=>', target.name,damage);
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
		config = config || {stats:{}};

		var stats = dungeon.stats;
		var spawn = {
			stats:{
				
			},
			status:{
				burn:false,
			},
			experience:config.experience||1,
			hp:10,
			name:config.name = 'Fireling',
			mp:1,
			ap:0,
			damage2x:['water'],
			damage50:['fire'],
			damage0:['dark'],
			actions:config.actions || ['fire_attack_1','defend'],
			action:function(name,options){
				var action = dungeon.actions[name];
				action.bind(this)(options);
			},
			takeDamage:function(attack){
				var damage = dungeon.calculate.damage(attack,this);
				this.hp-=damage;
			}
		}

		stats.forEach(function(s){spawn.stats[s] = config.stats[s] || 1});
		return spawn;
		
	}
};