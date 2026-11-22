// This file is an extraction/reference from V22; integrated into a closed IIFE.
// It depends on THREE, player, bots, NAV_NODES, hasLineOfSight and game helpers.
// Do not load alone as a standalone script.

      // =========================================================================
      // 10A. TEAM COORDINATION 3C — SQUAD RALLIES, INTEL SHARING & COVERING FIRE
      // 3C: Compute leaders first, then use only the selected leaders as rally anchors.
      // The previous loop let any sighting overwrite the leader's rally position;
      // its result changed with BOT array order and could cause squad oscillation.
      function buildSquadLeadership() {
        const squadRallyPos = {};
        const squadLeaderId = {};
        const squadBestPriority = {};
        const roleLeadPriority = { assault: 5, heavy: 4, medic: 3, engineer: 2, sniper: 1 };
        for (let i = 0; i < bots.length; i++) {
          const member = bots[i];
          if (!member.alive) continue;
          const key = `${member.team}_${member.squadId}`;
          const priority = (roleLeadPriority[member.classId] || 1) + (member.hp > 45 ? 10 : 0);
          const currentPriority = squadBestPriority[key];
          if (currentPriority === undefined || priority > currentPriority) {
            squadBestPriority[key] = priority;
            squadLeaderId[key] = member.id;
            squadRallyPos[key] = member.pos.clone();
          }
        }
        return { squadRallyPos, squadLeaderId };
      }

      // =========================================================================
      const TEAM_INTEL = {
        blue: { sightings: {}, retreatAlerts: [] },
        red:  { sightings: {}, retreatAlerts: [] }
      };

      function resetTeamIntel() {
        TEAM_INTEL.blue.sightings = {};
        TEAM_INTEL.blue.retreatAlerts = [];
        TEAM_INTEL.red.sightings = {};
        TEAM_INTEL.red.retreatAlerts = [];
      }

      function pruneTeamIntel(nowSec) {
        ['blue', 'red'].forEach((team) => {
          const intel = TEAM_INTEL[team];
          const ids = Object.keys(intel.sightings);
          for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const s = intel.sightings[id];
            if (!s || (nowSec - s.timestamp) > s.ttl || !isEntityStillAlive(id)) {
              delete intel.sightings[id];
            }
          }
          for (let i = intel.retreatAlerts.length - 1; i >= 0; i--) {
            const a = intel.retreatAlerts[i];
            if (a.expiresAt <= nowSec || !isEntityStillAlive(a.allyId) || (a.threatId && !isEntityStillAlive(a.threatId))) {
              intel.retreatAlerts.splice(i, 1);
            }
          }
        });
      }

      function reportTeamVisualSighting(team, squadId, reporterId, targetId, frozenPos) {
        if (!TEAM_INTEL[team] || !targetId || !frozenPos || !isEntityStillAlive(targetId)) return;
        if (![frozenPos.x, frozenPos.y, frozenPos.z].every(Number.isFinite)) return;
        const targetTeam = targetId === 'player' ? player.team : (bots.find((b) => b.id === targetId) || {}).team;
        if (targetTeam === team) return;
        const nowSec = performance.now() / 1000;
        TEAM_INTEL[team].sightings[targetId] = {
          targetId,
          pos: frozenPos.clone(),
          timestamp: nowSec,
          ttl: 3.6,
          squadId,
          reporterId
        };
      }

      function getSharedTeamSighting(bot, nowSec) {
        const intel = TEAM_INTEL[bot.team];
        if (!intel) return null;
        let best = null;
        let bestScore = Infinity;

        const ids = Object.keys(intel.sightings);
        for (let i = 0; i < ids.length; i++) {
          const s = intel.sightings[ids[i]];
          if (!s || s.reporterId === bot.id) continue;
          const age = nowSec - s.timestamp;
          if (age < 0 || age > s.ttl) continue;
          if (!isEntityStillAlive(s.targetId)) continue;

          const dist = Math.hypot(s.pos.x - bot.pos.x, s.pos.z - bot.pos.z);
          if (dist > 34) continue;

          const squadBonus = s.squadId === bot.squadId ? -11.0 : 0;
          const score = dist + age * 3.5 + squadBonus;
          if (score < bestScore) {
            bestScore = score;
            best = {
              targetId: s.targetId,
              pos: s.pos.clone(),
              remainingTtl: Math.max(0.8, s.ttl - age),
              sameSquad: s.squadId === bot.squadId
            };
          }
        }
        return best;
      }

      function broadcastRetreatCoverRequest(bot, threatPos, threatId, nowSec) {
        if (!threatPos) return;
        const alerts = TEAM_INTEL[bot.team].retreatAlerts;
        const existing = alerts.find((a) => a.allyId === bot.id);
        if (existing) {
          existing.allyPos.copy(bot.pos);
          existing.threatPos.copy(threatPos);
          existing.threatId = threatId || existing.threatId;
          existing.expiresAt = nowSec + 1.85;
        } else {
          alerts.push({
            allyId: bot.id,
            squadId: bot.squadId,
            allyPos: bot.pos.clone(),
            threatPos: threatPos.clone(),
            threatId: threatId || null,
            expiresAt: nowSec + 1.85
          });
        }
      }

      function findCoveringFireOpportunity(bot, botEye, nowSec) {
        if (bot.hp < 45 || bot.classId === 'sniper') return null;
        const alerts = TEAM_INTEL[bot.team].retreatAlerts;
        if (!alerts || alerts.length === 0) return null;

        let bestOpp = null;
        let bestDist = 28.0;

        for (let i = 0; i < alerts.length; i++) {
          const a = alerts[i];
          if (a.expiresAt <= nowSec || a.allyId === bot.id) continue;
          const dAlly = Math.hypot(a.allyPos.x - bot.pos.x, a.allyPos.z - bot.pos.z);
          const dThreat = Math.hypot(a.threatPos.x - bot.pos.x, a.threatPos.z - bot.pos.z);
          if (dAlly > 26.0 && dThreat > 30.0) continue;

          const effectiveDist = dThreat - (a.squadId === bot.squadId ? 6.0 : 0) - (bot.classId === 'heavy' ? 5.0 : 0);
          if (effectiveDist >= bestDist) continue;

          const targetEye = new THREE.Vector3(a.threatPos.x, a.threatPos.y + 1.32, a.threatPos.z);
          if (hasLineOfSight(botEye, targetEye)) {
            bestDist = effectiveDist;
            bestOpp = {
              threatPos: a.threatPos.clone(),
              targetEye,
              threatId: a.threatId,
              allyId: a.allyId
            };
          }
        }
        return bestOpp;
      }

      function getLaneFromX(x) {
        if (x < -17.5) return 0;
        if (x > 17.5) return 2;
        return 1;
      }

      function getTeamLaneCounts(team, excludeBotId) {
        const counts = [0, 0, 0];
        if (team === 'blue' && player.alive) {
          counts[getLaneFromX(player.pos.x)]++;
        }
        for (let i = 0; i < bots.length; i++) {
          const b = bots[i];
          if (!b.alive || b.team !== team || b.id === excludeBotId) continue;
          const lane = b.assignedLane !== undefined ? b.assignedLane : getLaneFromX(b.pos.x);
          counts[lane]++;
        }
        return counts;
      }

      function assignBotTacticalGoal(bot) {
        const isBlue = bot.team === 'blue';
        let lane = bot.squadId !== undefined ? bot.squadId : 1;

        const laneCounts = getTeamLaneCounts(bot.team, bot.id);
        if (laneCounts[lane] >= 3) {
          let minLane = lane;
          let minCount = laneCounts[lane];
          for (let l = 0; l < 3; l++) {
            if (laneCounts[l] < minCount) {
              minCount = laneCounts[l];
              minLane = l;
            }
          }
          lane = minLane;
        }
        bot.assignedLane = lane;

        let goal = 19;

        if (bot.classId === 'sniper') {
          const sniperByLane = lane === 0
            ? (isBlue ? [5, 8, 12] : [12, 8, 5])
            : lane === 2
              ? (isBlue ? [27, 29, 37] : [37, 35, 27])
              : (isBlue ? [45, 45, 16, 15] : [48, 48, 23, 24]);
          goal = sniperByLane[Math.floor(Math.random() * sniperByLane.length)];
        } else if (bot.classId === 'engineer') {
          const chokeByLane = lane === 0
            ? [7, 11, 17, 22]
            : lane === 2
              ? [28, 30, 34, 36, 49]
              : (isBlue ? [17, 18, 43, 16] : [21, 22, 46, 23]);
          goal = chokeByLane[Math.floor(Math.random() * chokeByLane.length)];
        } else if (bot.classId === 'heavy') {
          const heavyByLane = lane === 0
            ? (isBlue ? [7, 9, 11] : [11, 9, 7])
            : lane === 2
              ? (isBlue ? [30, 32, 34] : [34, 32, 30])
              : (isBlue ? [16, 18, 20] : [23, 21, 19]);
          goal = heavyByLane[Math.floor(Math.random() * heavyByLane.length)];
        } else if (bot.classId === 'medic') {
          const medicByLane = lane === 0
            ? (isBlue ? [6, 7, 9] : [12, 11, 9])
            : lane === 2
              ? (isBlue ? [29, 30, 32] : [35, 34, 32])
              : (isBlue ? [16, 18, 19] : [23, 21, 20]);
          goal = medicByLane[Math.floor(Math.random() * medicByLane.length)];
        } else {
          if (lane === 0) {
            const westGoals = isBlue ? [9, 11, 12] : [9, 7, 6];
            goal = westGoals[Math.floor(Math.random() * westGoals.length)];
          } else if (lane === 1) {
            const midGoals = isBlue ? [19, 20, 21, 23] : [20, 19, 18, 16];
            goal = midGoals[Math.floor(Math.random() * midGoals.length)];
          } else {
            const eastGoals = isBlue ? [32, 34, 35] : [32, 30, 29];
            goal = eastGoals[Math.floor(Math.random() * eastGoals.length)];
          }
        }

        const startIdx = findNearestNavNode(bot.pos);
        bot.goalNode = goal;
        bot.path = findPathAStar(startIdx, goal, bot.blockedNode);
        bot.pathIndex = 0;
      }

