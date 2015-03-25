angular.module('demo',[])
.run(function($rootScope,$interval){
	$rootScope.spawn = function(){
		$rootScope.dude1 = dungeon.entity(chars.Fireling);
		$rootScope.dude2 = dungeon.entity(chars.Fireling);

	}

	$rootScope.spawn();

	$interval(function(){
		$rootScope.dude1.step();
		$rootScope.dude2.step();

		var dude1 = 	$rootScope.dude1;
		var dude2 = 	$rootScope.dude2;

		if($rootScope.dude1.atb===255){
			dude1.action(dude1.actions[0],dude2)
		}

		if($rootScope.dude2.atb===255){
			dude2.action(dude2.actions[0],dude1)
		}
	},1)
})