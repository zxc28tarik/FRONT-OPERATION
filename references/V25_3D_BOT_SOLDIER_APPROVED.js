function createBotSoldierMesh(team, classId) {
        const { mats, geos } = getSoldierSharedAssets();
        const isBlue = team === 'blue';
        const uniformMat = isBlue ? mats.blueUniform : mats.redUniform;
        const pantsMat = isBlue ? mats.bluePants : mats.redPants;
        const iffMat = isBlue ? mats.blueIFF : mats.redIFF;

        const root = new THREE.Group();

        const pelvis = createLimbMesh(geos.pelvis, pantsMat);
        pelvis.position.y = 0.86;
        root.add(pelvis);

        const belt = createLimbMesh(geos.belt, mats.bootLeather, false);
        belt.position.y = 0.91;
        root.add(belt);

        const buckle = createLimbMesh(geos.beltBuckle, mats.gunSteel, false);
        buckle.position.set(0, 0.91, 0.115);
        root.add(buckle);

        function buildLeg(sideSign) {
          const hip = new THREE.Group();
          hip.position.set(sideSign * 0.105, 0.82, 0);

          const hipBall = createLimbMesh(geos.hipJoint, pantsMat, false);
          hip.add(hipBall);

          const thigh = createLimbMesh(geos.thigh, pantsMat);
          thigh.position.y = -0.18;
          hip.add(thigh);

          if (sideSign > 0) {
            const holster = createLimbMesh(geos.holster, mats.bootLeather, false);
            holster.position.set(0.082, -0.16, 0.01);
            hip.add(holster);
          }

          const knee = new THREE.Group();
          knee.position.set(0, -0.37, 0);

          const kneeBall = createLimbMesh(geos.kneeJoint, pantsMat, false);
          knee.add(kneeBall);

          const kneePad = createLimbMesh(geos.kneePad, mats.bootLeather, false);
          kneePad.position.set(0, -0.01, 0.048);
          knee.add(kneePad);

          const shin = createLimbMesh(geos.shin, pantsMat);
          shin.position.y = -0.18;
          knee.add(shin);

          const bootAnkle = createLimbMesh(geos.bootAnkle, mats.bootLeather, false);
          bootAnkle.position.set(0, -0.36, 0.01);
          knee.add(bootAnkle);

          const bootSole = createLimbMesh(geos.bootSole, mats.bootLeather);
          bootSole.position.set(0, -0.425, 0.045);
          knee.add(bootSole);

          const bootToe = createLimbMesh(geos.bootToe, mats.bootLeather, false);
          bootToe.scale.set(1.0, 0.65, 1.15);
          bootToe.position.set(0, -0.405, 0.125);
          knee.add(bootToe);

          hip.add(knee);
          root.add(hip);
          return { hip, knee };
        }

        const leftLeg = buildLeg(-1);
        const rightLeg = buildLeg(1);

        const upperBody = new THREE.Group();
        upperBody.position.y = 0.93;
        root.add(upperBody);

        const abdomen = createLimbMesh(geos.abdomen, uniformMat, false);
        abdomen.position.y = 0.08;
        upperBody.add(abdomen);

        const chest = createLimbMesh(geos.chest, uniformMat);
        chest.position.y = 0.28;
        upperBody.add(chest);

        const vestFront = createLimbMesh(geos.vestFront, mats.vestRig);
        vestFront.position.set(0, 0.28, 0.115);
        upperBody.add(vestFront);

        const vestBack = createLimbMesh(geos.vestBack, mats.vestRig);
        vestBack.position.set(0, 0.28, -0.115);
        upperBody.add(vestBack);

        [-0.095, 0, 0.095].forEach((px) => {
          const pouch = createLimbMesh(geos.magPouch, mats.pouchCoyote, false);
          pouch.position.set(px, 0.21, 0.155);
          upperBody.add(pouch);
        });

        const adminPouch = createLimbMesh(geos.adminPouch, mats.pouchCoyote, false);
        adminPouch.position.set(0, 0.34, 0.152);
        upperBody.add(adminPouch);

        const iffChest = createLimbMesh(geos.iffChest, iffMat, false);
        iffChest.position.set(0, 0.39, 0.156);
        upperBody.add(iffChest);

        const iffBack = createLimbMesh(geos.iffBack, iffMat, false);
        iffBack.position.set(0, 0.39, -0.152);
        upperBody.add(iffBack);

        const radio = createLimbMesh(geos.radioBody, mats.bootLeather, false);
        radio.position.set(-0.145, 0.35, 0.125);
        upperBody.add(radio);

        const antenna = createLimbMesh(geos.radioAnt, mats.gunMetal, false);
        antenna.position.set(-0.155, 0.48, 0.115);
        upperBody.add(antenna);

        if (classId === 'medic') {
          const medBag = createLimbMesh(geos.medBag, mats.medPack);
          medBag.position.set(0, 0.29, -0.185);
          upperBody.add(medBag);
          const ch = createLimbMesh(geos.medCrossH, mats.medCross, false);
          ch.position.set(0, 0.29, -0.252);
          upperBody.add(ch);
          const cv = createLimbMesh(geos.medCrossV, mats.medCross, false);
          cv.position.set(0, 0.29, -0.252);
          upperBody.add(cv);
        } else if (classId === 'engineer') {
          const engPack = createLimbMesh(geos.engPack, mats.engPack);
          engPack.position.set(0, 0.28, -0.185);
          upperBody.add(engPack);
          const tube = createLimbMesh(geos.engTube, mats.gunSteel, false);
          tube.position.set(0.14, 0.30, -0.19);
          upperBody.add(tube);
          const mine = createLimbMesh(geos.claymoreBack, mats.ghillieOlive, false);
          mine.position.set(-0.04, 0.24, -0.255);
          upperBody.add(mine);
        } else if (classId === 'sniper') {
          const cape = createLimbMesh(geos.sniperCape, mats.ghillieOlive, false);
          cape.position.set(0, 0.38, -0.02);
          upperBody.add(cape);
        } else if (classId === 'heavy') {
          const collar = createLimbMesh(geos.heavyCollar, mats.vestRig, false);
          collar.position.set(0, 0.46, 0);
          upperBody.add(collar);
          [-0.23, 0.23].forEach((sx) => {
            const pad = createLimbMesh(geos.heavyShoulder, mats.vestRig);
            pad.position.set(sx, 0.39, 0);
            upperBody.add(pad);
          });
          const heavyPack = createLimbMesh(geos.heavyPack, mats.pouchCoyote);
          heavyPack.position.set(0, 0.29, -0.195);
          upperBody.add(heavyPack);
          const feed = createLimbMesh(geos.ammoFeed, mats.brassBelt, false);
          feed.position.set(-0.18, 0.26, -0.11);
          upperBody.add(feed);
        }

        const leftShoulder = createLimbMesh(geos.shoulderJoint, uniformMat, false);
        leftShoulder.position.set(-0.21, 0.42, 0.02);
        upperBody.add(leftShoulder);

        const leftUpperArm = createLimbMesh(geos.upperArm, uniformMat);
        leftUpperArm.position.set(-0.19, 0.33, 0.11);
        leftUpperArm.rotation.set(-0.68, 0.22, -0.24);
        upperBody.add(leftUpperArm);

        const leftArmBand = createLimbMesh(geos.armBand, iffMat, false);
        leftArmBand.position.set(-0.195, 0.35, 0.09);
        leftArmBand.rotation.set(-0.68, 0.22, -0.24);
        upperBody.add(leftArmBand);

        const leftElbow = createLimbMesh(geos.elbowJoint, uniformMat, false);
        leftElbow.position.set(-0.15, 0.23, 0.19);
        upperBody.add(leftElbow);

        const leftForearm = createLimbMesh(geos.forearm, uniformMat);
        leftForearm.position.set(-0.07, 0.26, 0.31);
        leftForearm.rotation.set(-1.32, 0.56, 0.22);
        upperBody.add(leftForearm);

        const leftHand = createLimbMesh(geos.handGlove, mats.gloveDark, false);
        leftHand.position.set(0.01, 0.28, 0.42);
        upperBody.add(leftHand);

        const rightShoulder = createLimbMesh(geos.shoulderJoint, uniformMat, false);
        rightShoulder.position.set(0.21, 0.42, 0.02);
        upperBody.add(rightShoulder);

        const rightUpperArm = createLimbMesh(geos.upperArm, uniformMat);
        rightUpperArm.position.set(0.21, 0.32, 0.08);
        rightUpperArm.rotation.set(-0.55, -0.14, 0.14);
        upperBody.add(rightUpperArm);

        const rightArmBand = createLimbMesh(geos.armBand, iffMat, false);
        rightArmBand.position.set(0.21, 0.34, 0.065);
        rightArmBand.rotation.set(-0.55, -0.14, 0.14);
        upperBody.add(rightArmBand);

        const rightElbow = createLimbMesh(geos.elbowJoint, uniformMat, false);
        rightElbow.position.set(0.19, 0.22, 0.15);
        upperBody.add(rightElbow);

        const rightForearm = createLimbMesh(geos.forearm, uniformMat);
        rightForearm.position.set(0.16, 0.25, 0.24);
        rightForearm.rotation.set(-1.26, -0.28, -0.12);
        upperBody.add(rightForearm);

        const rightHand = createLimbMesh(geos.handGlove, mats.gloveDark, false);
        rightHand.position.set(0.13, 0.27, 0.31);
        upperBody.add(rightHand);

        const neck = createLimbMesh(geos.neck, mats.skinTone, false);
        neck.position.set(0, 0.49, 0.01);
        upperBody.add(neck);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.61, 0.01);

        const skull = createLimbMesh(geos.headSkull, mats.skinTone);
        headGroup.add(skull);

        const jaw = createLimbMesh(geos.jaw, classId === 'sniper' ? mats.ghillieOlive : mats.bootLeather, false);
        jaw.position.set(0, -0.042, 0.028);
        headGroup.add(jaw);

        const helmet = createLimbMesh(geos.helmetShell, mats.helmetOlive);
        helmet.position.set(0, 0.012, -0.005);
        headGroup.add(helmet);

        const helmetBand = createLimbMesh(geos.helmetBand, iffMat, false);
        helmetBand.position.set(0, 0.032, -0.005);
        headGroup.add(helmetBand);

        const nvg = createLimbMesh(geos.nvgMount, mats.gunMetal, false);
        nvg.position.set(0, 0.056, 0.118);
        headGroup.add(nvg);

        const goggles = createLimbMesh(geos.goggles, mats.visorLens, false);
        goggles.position.set(0, 0.014, 0.104);
        headGroup.add(goggles);

        [-0.118, 0.118].forEach((ex) => {
          const earCup = createLimbMesh(geos.earCup, mats.bootLeather, false);
          earCup.rotation.z = Math.PI / 2;
          earCup.position.set(ex, 0.002, -0.01);
          headGroup.add(earCup);
        });

        if (classId === 'sniper') {
          const hood = createLimbMesh(geos.sniperHood, mats.ghillieOlive, false);
          hood.position.set(0, 0.022, -0.01);
          headGroup.add(hood);
        }

        upperBody.add(headGroup);

        const weaponPivot = new THREE.Group();
        weaponPivot.position.set(0.11, 0.28, 0.26);

        const receiverLen = classId === 'sniper' ? 0.56 : classId === 'heavy' ? 0.52 : (classId === 'medic' || classId === 'engineer') ? 0.34 : 0.44;
        const barrelLen = classId === 'sniper' ? 0.48 : classId === 'heavy' ? 0.36 : (classId === 'medic' || classId === 'engineer') ? 0.16 : 0.28;

        const wBody = createLimbMesh(
          new THREE.BoxGeometry(classId === 'heavy' ? 0.072 : 0.052, classId === 'heavy' ? 0.088 : 0.068, receiverLen),
          mats.gunMetal
        );
        wBody.position.z = receiverLen * 0.22;
        weaponPivot.add(wBody);

        const wStock = createLimbMesh(new THREE.BoxGeometry(0.044, 0.082, 0.20), mats.bootLeather, false);
        wStock.position.set(0, -0.01, -0.14);
        weaponPivot.add(wStock);

        const wBarrel = createLimbMesh(
          new THREE.CylinderGeometry(0.012, 0.015, barrelLen, 8),
          mats.gunSteel,
          false
        );
        wBarrel.rotation.x = Math.PI / 2;
        wBarrel.position.set(0, 0.014, receiverLen * 0.72 + barrelLen * 0.45);
        weaponPivot.add(wBarrel);

        if (classId === 'sniper') {
          const wScope = createLimbMesh(new THREE.CylinderGeometry(0.024, 0.026, 0.28, 10), mats.bootLeather, false);
          wScope.rotation.x = Math.PI / 2;
          wScope.position.set(0, 0.062, 0.14);
          weaponPivot.add(wScope);
        } else if (classId === 'heavy') {
          const wBox = createLimbMesh(new THREE.BoxGeometry(0.11, 0.13, 0.13), mats.ghillieOlive, false);
          wBox.position.set(-0.07, -0.06, 0.12);
          weaponPivot.add(wBox);
        } else {
          const wMag = createLimbMesh(new THREE.BoxGeometry(0.032, 0.14, 0.052), mats.bootLeather, false);
          wMag.position.set(0, -0.085, 0.16);
          wMag.rotation.x = -0.16;
          weaponPivot.add(wMag);
        }

        const muzzleFlash = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.92 })
        );
        muzzleFlash.position.set(0, 0.014, receiverLen * 0.72 + barrelLen + 0.06);
        muzzleFlash.visible = false;
        weaponPivot.add(muzzleFlash);

        upperBody.add(weaponPivot);

        return {
          root,
          upperBody,
          head: headGroup,
          leftHip: leftLeg.hip,
          leftKnee: leftLeg.knee,
          rightHip: rightLeg.hip,
          rightKnee: rightLeg.knee,
          weaponPivot,
          muzzleFlash
        };
      }
