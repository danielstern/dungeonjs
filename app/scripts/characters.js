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
		damage0:['dark'],
		actions: ['fire_attack_1','defend'],
	}
}

var dungeon_actions = {
	fire_attack_1:function(target){
		var stats = dungeon.calculate.stats(this);
		var element = 'fire';

		var damage = stats.attack + 5;

		damage = dungeon.calculate.elemental(target,damage,element);

		if (Math.random() > 0.7) {
			console.log("Fire attack missed!");
			return;
		}

		if (Math.random() * stats.accuracy / dungeon.calculate.stats(target).evasion > 0.8) {
			console.log("Fire attack was parried!");
			return;
		}
		
		damage -= target.defense / 10;

		if (Math.random() > 0.2) {
			target.status.burn = true;
		}

		if (target.defending) damage *= 0.7;

		target.takeDamage(damage);
		console.log("Fire attack:",this.name, '=>', target.name,damage);
	},
	defend:function(){
		this.defending = true;
		var expiry = 200;
		this.onstep(function(a){
			expiry--;
			if (expiry===0){
				this.defending = false;
			}
		})

		console.log("Defend:",this.name);
	}
}