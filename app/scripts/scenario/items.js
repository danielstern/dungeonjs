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