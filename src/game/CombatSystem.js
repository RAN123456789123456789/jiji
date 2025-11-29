/**
 * 战斗系统
 * 处理攻击逻辑
 */
export class CombatSystem {
    constructor() {
        this.attackDamage = 5;
        this.attackRange = 5; // 攻击范围（距离）
        this.attackAngle = Math.PI; // 攻击角度（180度）
    }

    /**
     * 执行攻击
     * @param {THREE.Vector3} attackerPosition - 攻击者位置
     * @param {THREE.Vector3} attackerDirection - 攻击者朝向
     * @param {Array<Monster>} monsters - 所有怪兽列表
     * @returns {Array<Monster>} 被击中的怪兽列表
     */
    attack(attackerPosition, attackerDirection, monsters) {
        const hitMonsters = [];
        const direction = attackerDirection.clone().normalize();

        for (const monster of monsters) {
            if (!monster.isAlive) continue;

            const monsterPos = monster.getPosition();
            const toMonster = monsterPos.clone().sub(attackerPosition);
            const distance = toMonster.length();

            // 检查距离
            if (distance > this.attackRange) continue;

            // 检查角度（前方180度）
            toMonster.normalize();
            const dot = direction.dot(toMonster);
            const angle = Math.acos(dot);

            // 如果角度在90度以内（前方180度范围）
            if (angle <= this.attackAngle / 2) {
                hitMonsters.push(monster);
            }
        }

        return hitMonsters;
    }

    /**
     * 对怪兽造成伤害
     * @param {Monster} monster 
     * @returns {boolean} 是否死亡
     */
    damageMonster(monster) {
        return monster.takeDamage(this.attackDamage);
    }

    /**
     * 设置攻击伤害
     */
    setAttackDamage(damage) {
        this.attackDamage = damage;
    }

    /**
     * 设置攻击范围
     */
    setAttackRange(range) {
        this.attackRange = range;
    }

    /**
     * 设置攻击角度（弧度）
     */
    setAttackAngle(angle) {
        this.attackAngle = angle;
    }
}

