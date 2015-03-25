var dungeon = {
	stats:'max_hp.max_mp.attack.defense.special.resist.speed.evasion.accuracy'.split('.'),
	status:'poison.float.berserk.fear.stone.curse.confused'.split('.'),
	properties:'undead.flying.magical.human.ghost.beast'.split('.'),
	MAX_ATB:255,
	calculate:{
		damage:function(attack,defender){
			var d = dungeon.calculate.stats(defender);
			return attack.damage - d.defense / 10;
		},
		stats:function(entity){
			var calculated = {};
			var level = dungeon.calculate.level(entity);
			dungeon.stats.forEach(function(key){
				calculated[key] =  entity[key] * level;
			})
			calculated.level = level;
			return calculated;
		},
		level:function(entity){
			return Math.ceil(1 * Math.sqrt(entity.experience/250));
		},
		elemental:function(target,damage,element){
			if (target.damage2x.indexOf(element) > -1) {
				damage *=2;
			}

			if (target.damage50.indexOf(element) > -1) {
				damage /= 2;
			}

			if (target.damage0.indexOf(element) > -1) {
				damage *= 0;
			}

			return damage;

		}
	},
	actions:dungeon_actions,
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

		var stats = dungeon.stats;
		var stepListeners = [];
		var spawn = {
			status:{},
			experience:config.experience||1,
			hp:config.max_hp||1,
			name:config.name||'unknown',
			mp:config.max_mp||1,
			ap:0,
			atb:0,
			dead:config.dead||false,
			team:config.team||0,
			ai:config.ai||function(){return 'defend'},
			damage2x:config.damage2x||[],
			damage50:config.damage50||[],
			damage0:config.damage0||[],
			actions:config.actions || ['defend'],
			action:function(name,options){
				var action = dungeon.actions[name];
				action.bind(this)(options);
				this.atb = 0;
			},
			takeDamage:function(damage){
				this.hp-=damage;
			},
			step:function(){
				if (this.atb < dungeon.MAX_ATB) {
					this.atb++;
				}

				if (this.atb % 100 === 0 && this.status.burn) {

				};

				if (this.hp <= 0) {
					this.dead = true;
				}

				stepListeners.forEach(function(a){a(spawn)})
			},
			onstep:function(l){
				stepListeners.push(l);
			}
		}

		stats.forEach(function(s){spawn[s] = config[s] || 1});
		spawn.hp = dungeon.calculate.stats(spawn).max_hp;
		return spawn;
		
	}
};