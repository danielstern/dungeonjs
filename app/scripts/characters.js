var chars = {
	'goblin':{
		name:'goblin',
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
		actions: ['attack','defend'],
	}
}

var ai = {
	'00':function(field,turn){
		var team = this.team;
		return {
			action:Math.random() > 0.5 ? 'attack' : 'defend',
			target:field.filter(function(a){return a.team != team})[0]
		};
	}
}

dungeon.action("attack",{
	damage:'D1',
	accuracy:'A1',
	processor:'P1',
	element:'E2',
	name:'N1'
})

.action("defend",{
	damage:null,
	accuracy:null,
	processor:'P2',
	element:null,
	name:'defend'
})

var d_damage = {
	'D1':function(entity){return entity.attack + 5}
}
var d_accuracy = {
	'A1':function(entity){return entity.accuracy}
}
var d_processor = {
	'P1':function(options){
		var entity = options.entity;
		var target = options.target
		var element = options.element;
		var accuracy = options.accuracy(entity);
		var damage = options.damage(entity);

		
		damage = dungeon.calculate.elemental(target,damage,element);
		damage = dungeon.calculate.physicalDamage(target,damage);

		var hit = dungeon.calculate.hit(entity,target);

		if (hit) {
			target.takeDamage(damage);
		};
		
		dungeon.meta.event(options.name(),{attacker:entity,target:target,element:element,hit:hit,damage:damage});
	},
	'P2':function(){
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
	}
}

var d_name = {
	'N1':function(){return 'fire attack'}
}

