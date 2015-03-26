
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

.action("poison_cloud_1",function(target){
	var entity = this;
	var hit = Math.random() < 0.3;
		
	if (hit) {
		target.takeStatus('poison');
	}

	dungeon.meta.event("Poison Cloud",{attacker:entity,target:target,hit:hit});

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
.targeting("ceilidh",function(actor){
	return dungeon.filters.differentTeam(actor.team)
})

.action("Heal",function(target){
		var recovery = 40 + this.special * 3;
		var undead = target.properties.undead;
		if (undead) {
			target.takeDamage(recovery);
		} else {
			target.recoverHP(recovery);
		}

		dungeon.meta.event("ceilidh",{attacker:this,target:target,undead:undead});
	})
.targeting("Heal",function(actor){
	return dungeon.filters.sameTeam(actor.team);
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

	var damage = this.attack + 8;
	var hit = dungeon.calculate.hit(this,target);
	
	damage = dungeon.calculate.physicalDamage(target,damage)

	if (hit) {
		target.takeDamage(damage);
	};

	dungeon.meta.event("Berserk Attack",{attacker:this,target:target,hit:hit,damage:damage});
})

.targeting("berserk_attack",function(actor){
	return dungeon.filters.differentTeam(actor.team)
})

.action("dirk_attack",function(target){

	var damage = this.attack + 12;
	var hit = dungeon.calculate.hit(this,target);
	
	damage = dungeon.calculate.physicalDamage(target,damage)

	if (hit) {
		target.takeDamage(damage);
	};

	dungeon.meta.event("Dirk Attack",{attacker:this,target:target,hit:hit,damage:damage});
})
.targeting("dirk_attack",function(actor){
	return dungeon.filters.differentTeam(actor.team)
})