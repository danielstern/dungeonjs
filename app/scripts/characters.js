var chars = {
	'Fireling':{
		name:'Fireling',
		experience:3600,
		max_hp:100,
		max_mp:10,
		ap:0,
		atb:0,
		attack:3,
		defense:2,
		evasion:2,
		speed:2,
		properties:['magical'],
		ai:function(field,turn){
			var team = this.team;
			if (Math.random() < 1) {
				return {
					action:'ceilidh',
					target:field.filter(function(a){return a.team != team})[0]
				};
			}
			return {
				action:Math.random() > 0.5 ? 'fire_attack_1' : 'defend',
				target:field.filter(function(a){return a.team != team})[0]
			};
		},
		team:0,
		damage2x:['water'],
		damage50:['fire'],
		damage0:[],
		actions: ['fire_attack_1','defend'],
	},
	'Ghoul':{
		name:'Ghoul',
		experience:2600,
		max_hp:90,
		max_mp:12,
		ap:0,
		atb:0,
		attack:2,
		defense:1,
		resist:2,
		evasion:3,
		speed:3,
		properties:['magical','undead'],
		ai:function(field,turn){
			var team = this.team;
			if (Math.random() < 0.3) {
				return {
					action:'poison_cloud_1',
					target:field.filter(function(a){return a.team != team})
				};
			}
			return {
				action:Math.random() > 0.5 ? 'special_attack_1' : 'defend',
				target:field.filter(function(a){return a.team != team})[0]
			};
		},
		team:0,
		damage2x:['light'],
		damage50:[''],
		damage0:['dark'],
		immune:['petrify'],
		actions: ['defend'],
	}
}

dungeon.action("fire_attack_1",function(target){
	var stats = dungeon.calculate.stats(this);
	var targetStats = dungeon.calculate.stats(target);
	var element = 'fire';
	var accuracy = 0.7;
	var damage = stats.attack + 5;

	var hit = dungeon.calculate.hit(this,target,accuracy);
	
	damage = dungeon.calculate.elemental(target,damage,element);
	damage = dungeon.calculate.physicalDamage(targetStats,damage)

	if (hit) {
		target.takeDamage(damage);
		if (Math.random() > 0.2) {
			target.takeStatus(burn);
		}
	};
		

	dungeon.meta.event("Fire Attack",{attacker:this,target:target,element:element,hit:hit,damage:damage});
})
.action("special_attack_1",function(target){
	var stats = dungeon.calculate.stats(this);
	var damage = stats.special + 4;

	var hit = Math.random() > 0.8;

	
	damage -= target.resist / 10;

	if (target.defending) damage *= 0.8;

	if (hit) {
		target.takeDamage(damage);	
	}

	dungeon.meta.event("Special Attack",{attacker:this,target:target,hit:hit,damage:damage});
})
.action("poison_cloud_1",function(targets){
		var entity = this;
		targets.forEach(function(target){
			var hit = Math.random() < 0.3;
			
			if (hit) {
				target.takeStatus('poison');
			}

			dungeon.meta.event("Poison Cloud",{attacker:entity,target:target,hit:hit});
		})		

	})
.action("evil_laugh",function(target){
		var hit = Math.random() < 0.3;
		if (hit) {
			target.takeStatus('fear');
		}

		dungeon.meta.event("Evil Laugh",{attacker:this,target:target,hit:hit});
	})
.action("ceilidh",function(target){
		var hit = Math.random() < 0.3;
		if (hit) {
			target.takeStatus('berserk');
		}

		dungeon.meta.event("ceilidh",{attacker:this,target:target,hit:hit});
	})
.action("Heal",function(target){
		var stats = dungeon.calculate.stats(this);
		var recovery = 40 + stats.special * 3;
		var undead = target.properties.undead;
		if (undead) {
			target.takeDamage(recovery);
		} else {
			target.recoverHP(recovery);
		}

		dungeon.meta.event("ceilidh",{attacker:this,target:target,hit:hit,undead:undead});
	})
.action("defend",function(){
	this.defending = true;
	var expiry = 200;
	var entity = this;
	this.onstep(function(a){
		expiry--;
		if (expiry===0){
			this.defending = false;
			dungeon.meta.event("stopDefend",{attacker:entity});
		}
	})

	dungeon.meta.event("Defend",{attacker:this});
})
.action("petrified",function(){
	console.log("Petrified:",this.name);
})
.action("berserk_attack",function(target){
	if (target instanceof Array) {
		target = target[0];
	}
	var stats = dungeon.calculate.stats(this);
	var targetStats = dungeon.calculate.stats(target);
	var damage = stats.attack + 8;
	var hit = dungeon.calculate.hit(this,target);
	
	damage = dungeon.calculate.physicalDamage(targetStats,damage)

	if (hit) {
		target.takeDamage(damage);
	};

	dungeon.meta.event("Berserk Attack",{attacker:this,target:target,hit:hit,damage:damage});
})
