angular.module('demo',[])
.run(function($rootScope,$interval){
	$rootScope.spawn = function(){
		$rootScope.dude1 = dungeon.entity(chars.Fireling);
		$rootScope.dude2 = dungeon.entity(chars.Ghoul);
		$rootScope.dude3 = dungeon.entity(chars.Ghoul);

		var dude1 = 	$rootScope.dude1;
		var dude2 = 	$rootScope.dude2;
		var dude3 = 	$rootScope.dude3;
		dude3.team = 1;

		$rootScope.dudes = [dude1,dude2,dude3]

	}

	$rootScope.spawn();

	$interval(function(){

		$rootScope. dudes.forEach(function(dude){
			if (dude.dead) return;
			dude.step();
			if(dude.atb>=255){
				var move = ai[dude.ai]($rootScope. dudes.filter(function(d){return !d.dead}));
				dude.action(move.action,move.target)
			}
		})

	},10)
})
.directive('dungeonEntityDisplay',function(){
	return {
		restrict:"AE",
		templateUrl:"entity.html"
	}

})
.filter('team',function(){

	return function(d,a){
		// debugger;
		return d.filter(function(e){return e.team===a})
	}
})