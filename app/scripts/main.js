angular.module('demo',[])
.run(function($rootScope,$interval){
	$rootScope.spawn = function(){
		$rootScope.dude1 = dungeon.entity(chars.Fireling);
		$rootScope.dude2 = dungeon.entity(chars.Fireling);

	}

	$rootScope.spawn();

	$interval(function(){

	
		var dude1 = 	$rootScope.dude1;
		var dude2 = 	$rootScope.dude2;
		if (dude1.dead || dude2.dead) return;

		$rootScope.dude1.step();
		$rootScope.dude2.step();


		if($rootScope.dude1.atb===255){
			dude1.action(dude1.ai([dude1,dude2]),dude2)
		}

		if($rootScope.dude2.atb===255){
			dude2.action(dude2.ai([dude1,dude2]),dude1)
		}
	},1)
})