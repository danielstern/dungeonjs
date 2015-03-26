angular.module('demo',[])
.run(function($rootScope,$interval){
	$rootScope.spawn = function(){
		var dude1 = dungeon.entity(dungeon.characters['Fireling']()),
			dude2 = dungeon.entity(dungeon.characters['Ghoul']());

			var dude1Inventory = dungeon.inventory();
			dude1Inventory.add('potion');
			dude1Inventory.add('dirk');
			dude1Inventory.equip('dirk',dude1);
			$rootScope.inventory = dude1Inventory;

			dude2.team = 1;
			dude2.auto = false;

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

dungeon.item('potion',{
	use:function(targets){
		targets.forEach(function(target){
            target.recoverHP(50);
        })
		
	}
})
.item('dirk',{
	equip:'weapon',
	replaceAction:'dirk_attack',
	replaceActionOn:['attack','fire_attack_1']
})