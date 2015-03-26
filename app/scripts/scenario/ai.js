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
.ai('01',function(field,turn){
	var team = this.team;
	if (Math.random() < 0.3) {
		return {
			action:'poison_cloud_1',
			targets:field.filter(dungeon.filters.differentTeam(team))
		};
	}
	return {
		action:Math.random() > 0.5 ? 'special_attack_1' : 'defend',
		targets:field.filter(dungeon.filters.differentTeam(team))
	};
})