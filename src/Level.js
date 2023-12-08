import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'greenyellow' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' })


const getSpeed = () => {
    return (Math.random() + .2) * (Math.random() < .5 ? -1 : 1)
}

function BlockStart({ position = [0, 0, 0] }) {
    return <group position={position}>
        {/* Floor */}
        <mesh geometry={boxGeometry} material={floor1Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />
    </group>
}
function BlockEnd({ position = [0, 0, 0] }) {
    const hamburger = useGLTF('./hamburger.glb')
    hamburger.scene.children.forEach((mesh) => {
        mesh.castShadow = true
    })

    return <group position={position} >
        <RigidBody type='fixed' colliders='hull' restitution={.2} friction={0} position-y={.25}>

            <primitive object={hamburger.scene} scale={.2} />
        </RigidBody>
        {/* Floor */}
        <mesh geometry={boxGeometry} material={floor1Material} position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow />
    </group>
}

export function BlockSpinner({ position = [0, 0, 0] }) {
    const obstacle = useRef()
    const [speed] = useState(() => getSpeed())

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
        obstacle.current.setNextKinematicRotation(rotation)
    })
    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor2Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />

        <RigidBody ref={obstacle} type='kinematicPosition' position={[0, .3, 0]} restitution={.2} friction={0} >
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockLimbo({ position = [0, 0, 0] }) {
    const obstacle = useRef()
    const [timeOffset] = useState(Math.random() * Math.PI * 2)
    const [speed] = useState(() => getSpeed())

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const yTranslation = Math.sin(time + timeOffset) + 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: yTranslation, z: position[2] })
    })
    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor2Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />

        <RigidBody ref={obstacle} type='kinematicPosition' position={[0, .3, 0]} restitution={.2} friction={0} >
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockAxe({ position = [0, 0, 0] }) {
    const obstacle = useRef()
    const [timeOffset] = useState(Math.random() * Math.PI * 2)
    const [speed] = useState(() => getSpeed())

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const xTranslation = Math.sin(time + timeOffset) * 1.25
        obstacle.current.setNextKinematicTranslation({ x: xTranslation, y: position[1] + .76, z: position[2] })
    })
    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor2Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />

        <RigidBody ref={obstacle} type='kinematicPosition' position={[0, .3, 0]} restitution={.2} friction={0} >
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[1.5, 1.5, 0.3]} castShadow receiveShadow />
        </RigidBody>
    </group>
}

function Bounds({ length }) {

    return <>
        <RigidBody type='fixed' restitution={.2} frixtion={0} >
            <mesh geometry={boxGeometry} material={wallMaterial} position={[2.15, .75, -(length * 2) + 2]} scale={[.3, 1.5, 4 * length]} castShadow />
            <mesh geometry={boxGeometry} material={wallMaterial} position={[-2.15, .75, -(length * 2) + 2]} scale={[.3, 1.5, 4 * length]} receiveShadow />
            <mesh geometry={boxGeometry} material={wallMaterial} position={[0, .75, -(length * 4) + 2]} scale={[4, 1.5, .3]} receiveShadow />
            <CuboidCollider args={[2, .1, 2 * length]} position={[0, -.1, -(length * 2) + 2]} restitution={.2} friction={1} />
        </RigidBody>
    </>
}

export function Level({ count = 15, types = [BlockSpinner, BlockAxe, BlockLimbo] }) {

    const blocks = useMemo(() => {
        const blocks = []
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            blocks.push(type)
        }
        return blocks
    }, [count, types])

    return <>
        <BlockStart position={[0, 0, 0]} />
        {blocks.map((Block, i) => {
            return <Block key={i} position={[0, 0, (i + 1) * -4]} />

        })}
        <BlockEnd position={[0, 0, -(count + 1) * 4]} />

        <Bounds length={count + 2} />
    </>

}
