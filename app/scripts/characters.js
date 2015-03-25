var chars = {
	'Fireling':{
		name:'Fireling',
		experience:3600,
		max_hp:12,
		max_mp:2,
		ap:0,
		atb:0,
		attack:3,
		defense:2,
		evasion:2,
		properties:['magical'],
		ai:function(field,turn){
			var team = this.team;
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
		max_hp:9,
		max_mp:6,
		ap:0,
		atb:0,
		attack:2,
		defense:1,
		resist:2,
		evasion:3,
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

	if (Math.random() > 0.2) {
		target.status.burn = true;
	}

	if (target.defending) damage *= 0.7;

	if (hit) {
		target.takeDamage(damage);
	};
		

	dungeon.meta.event("Fire Attack",{attacker:this,target:target,element:element,hit:hit,damage:0});
})
.action("special_attack_1",function(target){
	var stats = dungeon.calculate.stats(this);
	var damage = stats.special + 4;

	if (Math.random() > 0.8) {
		console.log("Special attack 1 missed!");
		return;
	}
	
	damage -= target.resist / 10;

	if (target.defending) damage *= 0.9;

	target.takeDamage(damage);

	console.log("Special attack:",this.name, '=>', target.name,damage);
})
.action("poison_cloud_1",function(targets){
		targets.forEach(function(target){
			if (Math.random() > 0.3) {
				console.log("poison cloud missed!");
				return;
			}

			target.takeStatus('poison');
			console.log("Poisoned:",this.name, '=>', target.name);

		})		
	})
.action("evil_laugh",function(target){
		if (Math.random() > 0.3) {
			target.takeStatus('fear');
		}
	})
.action("defend",function(){
		this.defending = true;
		var expiry = 200;
		this.onstep(function(a){
			expiry--;
			if (expiry===0){
				this.defending = false;
			}
		})

		console.log("Defend:",this.name);
	})
.action("petrified",function(){
	console.log("Petrified:",this.name);
})
