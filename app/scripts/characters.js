var chars = {
	'Fireling':{
		name:'Fireling',
		max_hp:100,
		max_mp:10,
		ap:0,
		atb:0,
		attack:3,
		defense:2,
		evasion:2,
		speed:2,
		properties:['magical'],
		ai:'00',
		team:0,
		damage2x:['water'],
		damage50:['fire'],
		damage0:[],
		actions: ['fire_attack_1','defend','ceilidh','poison_cloud_1'],
	}
}

dungeon.ai('00',function(field,turn){
	var team = this.team;
	if (Math.random() < 0.2) {
		return {
			action:'ceilidh',
			targets:field.filter(function(a){return a.team != team})
		};
	}
	return {
		action:Math.random() > 0.5 ? 'fire_attack_1' : 'defend',
		targets:field.filter(function(a){return a.team != team})
	};
})

dungeon.action("fire_attack_1",function(target){

	var element = 'fire';
	var accuracy = 0.7;
	var damage = this.attack + 5;

	var hit = dungeon.calculate.hit(this,target);
	
	damage = dungeon.calculate.elemental(target,damage,element);
	damage = dungeon.calculate.physicalDamage(target,damage);

	if (hit) {
		target.takeDamage(damage);
		if (Math.random() > 0.2) {
			target.takeStatus('burn');
		}
	};
		

	dungeon.meta.event("Fire Attack",{attacker:this,target:target,element:element,hit:hit,damage:damage});
})
.targeting("fire_attack_1",function(actor){
	return dungeon.filters.differentTeam(actor.team)
})

.action("special_attack_1",function(target){

	var damage = this.special + 4,
	 	hit = dungeon.calculate.hit(this,target);

	damage = dungeon.calculate.specialDamage(target,damage);

	if (hit) {
		target.takeDamage(damage);	
	}

	dungeon.meta.event("Special Attack",{attacker:this,target:target,hit:hit,damage:damage});
})
.targeting("special_attack_1",function(actor){
	return dungeon.filters.differentTeam(actor.team)
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
.targeting("poison_cloud_1",function(actor){
	return dungeon.filters.differentTeam(actor.team)
})

.action("ceilidh",function(target){
		var hit = Math.random() < 0.3;
		if (hit) {
			target.takeStatus('berserk');
		}

		dungeon.meta.event("ceilidh",{attacker:this,target:target,hit:hit});
	})
.action("Heal",function(target){
		var recovery = 40 + this.special * 3;
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
.targeting("defend",function(actor){
	return function(){};
})

.action("berserk_attack",function(target){
	if (target instanceof Array) {
		target = target[0];
	}
	var damage = this.attack + 8;
	var hit = dungeon.calculate.hit(this,target);
	
	damage = dungeon.calculate.physicalDamage(target,damage)

	if (hit) {
		target.takeDamage(damage);
	};

	dungeon.meta.event("Berserk Attack",{attacker:this,target:target,hit:hit,damage:damage});
})
.status( "poison", {
            beforeAction: function(stats) {
                var damage = stats.max_hp * 0.05;
                stats.hp -= damage;
                dungeon.meta.event("fireDamage", {
                    target: this,
                    damage: damage
                });
            }

        })
.status("burn", {
            beforeAction: function(stats) {
                var damage = stats.max_hp * 0.1;
                if (Math.random() > 0.5) stats.hp -= damage;
                dungeon.meta.event("poisonDamage", {
                    target: this,
                    damage: damage
                });
            }
        })
.status('stone', {
    replaceAction: 'petrified'
})
.status("berserk", {
    replaceAction: 'berserk_attack'
});