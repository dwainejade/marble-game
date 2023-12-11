import { RigidBody, useRapier } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import useGame from "./stores/useGame"

export default function Player() {
    const body = useRef()
    const [subscribeKeys, getKeys] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const [smoothedCameraPosition] = useState(() => new THREE.Vector3(20, 20, 20))
    const [smoothedCameraTarget] = useState(() => new THREE.Vector3())
    const { phase, start, end, restart, blocksCount } = useGame()

    const jump = () => {
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: - 1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)

        if (hit.toi < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
        }
    }

    const reset = () => {
        console.log('RESET')
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

    useEffect(() => {
        const unsubscribePhase = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'ready') {
                    // Do NOT change the level here. This should only log the phase change.
                    console.log('Phase is now ready');
                }
            }
        );

        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === ('ready' || 'playing'))
                    reset()
            }
        )

        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) => {
                if (value)
                    jump()
            }
        )

        const unsubscribeAny = subscribeKeys(() => {
            // Get the current phase directly from the store
            const currentPhase = useGame.getState().phase;
            if (currentPhase === 'ready') {
                start();
            }
        });

        return () => {
            unsubscribePhase()
            unsubscribeReset()
            unsubscribeJump()
            unsubscribeAny()
        }
    }, [])


    useFrame((state, delta) => {
        const { forward, backward, leftward, rightward } = getKeys()
        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = .6 * delta
        const torqueStrength = .2 * delta

        if (forward) {
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }
        if (backward) {
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }
        if (rightward) {
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }
        if (leftward) {
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        // Camera
        const bodyPosition = body.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        /**
        * Phases
        */
        if (bodyPosition.z < - (blocksCount * 4 + 2))
            useGame.getState().end()

        if (bodyPosition.y < - 4)
            useGame.getState().restart()
    })

    return <RigidBody ref={body} colliders="ball"
        canSleep={false}
        position={[0, 1, 0]}
        restitution={.2}
        friction={1}
        linearDamping={1}
        angularDamping={1}
    >
        <mesh castShadow>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial flatShading color='mediumpurple' />
        </mesh>
    </RigidBody>
}