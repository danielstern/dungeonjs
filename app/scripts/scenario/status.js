dungeon.status( "poison", {
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