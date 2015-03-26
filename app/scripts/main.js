angular.module('demo',[])
.run(function($rootScope,$interval){
	$rootScope.spawn = function(){
		var dude1 = dungeon.entity(chars.Fireling),
			dude2 = dungeon.entity(chars.Fireling);

			dude2.team = 1;
			dude2.auto = true;

			$rootScope.dudes = [dude1,dude2]
			$rootScope.battle = dungeon.battle($rootScope.dudes)

	}

	$rootScope.spawn();

	$interval(function(){
		$rootScope. battle.step()

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
		return d.filter(function(e){return e.team===a})
	}
})