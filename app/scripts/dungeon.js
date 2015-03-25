var dungeon = {
    MAX_ATB: 255,
    metaListeners: [],
    meta: {
        event: function(type, options) {
            console.log(type, options);
            dungeon.metaListeners.filter(function(a) {
                return a.type === type
            }).forEach(function(a) {
                a(options);
            })
        },
        listen: function(type, callback) {
            dungeon.metaListeners.push({
                type: type,
                callback: callback
            })
        }
    },
    calculate: {
        physicalDamage: function(target, damage) {
            if (target.defending) damage *= 0.7;
            return damage - target.defense / 10;
        },
        specialDamage: function(target, damage) {
            return damage - target.resist / 8;
        },
        level: function(entity) {
            return Math.ceil(1 * Math.sqrt(entity.experience / 250));
        },
        hit: function(attacker, defender, accuracy) {
            var ratio = attacker.accuracy / defender.evasion;
            if (ratio > 1) {
                return true;
            }
            return Math.random() > ratio / 2;
        },
        elemental: function(target, damage, element) {
            if (target.damage2x.indexOf(element) > -1) {
                damage *= 2;
            }

            if (target.damage50.indexOf(element) > -1) {
                damage /= 2;
            }

            if (target.damage0.indexOf(element) > -1) {
                damage *= 0;
            }

            return damage;
        },
        atb: function(char) {
            var increase = char.speed;
            if (char.haste) increase *= 2;
            if (char.slow) increase /= 2;
            return increase;
        }
    },
    actions: {},
    /*
		Add a new action that entities can do.
	*/
    action: function(name, action) {
        this.actions[name] = action;
        return this;
    },
    proto: function() {

        return {
            status: {},
            experience: 0,
            hp: 1,
            max_hp: 1,
            name: 'unknown',
            mp: 1,
            atb: 0,
            dead: false,
            team: 0,
            attack: 1,
            defense: 1,
            special: 1,
            resist: 1,
            evasion: 1,
            accuracy: 1,
            speed: 1,
            luck: 1,
            ai: function() {
                return {
                    action: 'defend'
                }
            },
            damage2x: [],
            damage50: [],
            immune: [],
            stepListeners: [],
            damage0: [],
            properties: [],
            actions: ['defend'],
            action: function(name, target) {
                var action = dungeon.actions[name];
                var stats = this;

                for (var k in this.status) {
                    if (this.status[k]) {
                        var status = dungeon.statuses[k];
                        if (status.replaceAction) action = dungeon.actions[status.replaceAction];
                        if (status.beforeAction) status.beforeAction(this);
                    }
                }

                dungeon.meta.event("action", {
                    actor: this,
                    name: name,
                    target: target
                });
                action.bind(this)(target);
                this.atb = 0;

            },
            takeDamage: function(damage) {
                this.hp -= damage;
                dungeon.meta.event("takeDamage", {
                    target: this,
                    damage: damage
                });
            },
            getCalculatedStats: function() {
                return dungeon.calculate.stats(this);
            },
            recoverHP: function(hp) {
                this.hp += hp;
                if (this.hp > this.max_hp) this.hp = this.max_hp;
                dungeon.meta.event("recoverHP", {
                    target: this,
                    hp: hp
                });

            },
            fullHeal: function() {
                this.hp = this.max_hp;
                this.mp = this.max_mp;
                this.dead = false;
                for (s in this.status) {
                    this.status[s] = false;
                }
            },

            takeStatus: function(status) {
                var immune = this.immune.indexOf(status) > -1;
                if (!immune) {
                    this.status[status] = true;
                }

                dungeon.meta.event("statusInflicted", {
                    target: this,
                    immune: immune
                });
            },
            step: function() {

                var entity = this;

                if (this.atb < dungeon.MAX_ATB) {
                    this.atb += dungeon.calculate.atb(this);
                }

                if (this.hp <= 0 && !this.dead) {
                    this.dead = true;
                    dungeon.meta.event("dead", {
                        target: this
                    });
                }

           

                this.stepListeners.forEach(function(a) {
                    a(entity)
                })
            },
            onstep: function(l) {
                this.stepListeners.push(l);
                dungeon.meta.event("step", {
                    target: this
                });
            }
        }

    },
    statuses: {},
    status: function(name, status) {
        this.statuses[name] = status;
        return this;
    },

    /*
		Creates a blueprint that returns new instances of a creature.
	*/
    entity: function(config) {
        var spawn = dungeon.proto();

        for (stat in config) {
            spawn[stat] = config[stat];
        }

        spawn.fullHeal();
        return spawn;

    }
};
