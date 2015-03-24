var dungeon = {
	elements:{
		fire:{
			multipliers:{
				ice:1.5,
				water:0.5
			}
		}
	},
	calculate:{
		damage:function(attack,defender){
			return attack.damage - defender.defense / 10;
		}
	},
	actions:{
		attack:function(options){
			var target = options.target;
			options.target.takeDamage({
				damage:this.attack,
				element:options.element
			});
		}
	},
	entity:function(config){
		config = config || {};

		var hp = config.hp || 100,
			mp = config. mp || 10,
			attack = config.attack || 10,
			defense = config.defense || 10,
			special = config.special || 10,
			resist = config.resist || 10,
			speed = config.speed || 10,
			evade = config.speed || 10,
			accuracy = config.accuracy || 10,
			actions = ['attack','defend'];

		var entity = function(ghost){
			ghost = ghost || {};
			return {
				hp:ghost.hp || hp,
				mp:ghost.mp || mp,
				attack:ghost.attack || attack,
				defense:ghost.defense || defense,
				special:ghost.special || special,
				resist:ghost.resist || resist,
				actions:ghost.actions|| actions,
				action:function(name,options){
					if (this.actions.indexOf(name)===-1){
						console.error("Action error, action not available",name);
					};

					var action = dungeon.actions[name];
					action.bind(this)(options);

				},
				takeDamage:function(attack){
					var damage = dungeon.calculate.damage(attack,this);
					this.hp-=damage;
				}
			}
		};

		return entity;
	}
};