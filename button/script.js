function button(source, options){
    const gyouzaElement = document.createElement("span")
    gyouzaElement.innerText = "若村"
    party.scene.current.createEmitter({
        emitterOptions: {
            loops: 1,
            useGravity: false,
            modules: [
                new party.ModuleBuilder()
                    .drive("rotation")
                    .by((t) => new party.Vector(0, 0, 100).scale(t))
                    .relative()
                    .build(),
                new party.ModuleBuilder()
                    .drive("opacity")
                    .by(
                        new party.NumericSpline(
                        { time: 0, value: 1 },
                        { time: 0.5, value: 1 },
                        { time: 1, value: 0 },
                        )
                    )
                    .through("relativeLifetime")
                    .build(),
            ],
        },
        emissionOptions: {
            rate: 0,
            bursts: [{ time: 0, count: party.variation.range(10, 20) }],
            sourceSampler: party.sources.dynamicSource(source),
            angle: party.variation.range(0, 360),
            initialSpeed: party.variation.range(50, 250),
            initialLifetime: party.variation.range(1, 4),
            initialRotation: new party.Vector(0,0,90),
            initialColor: party.variation.gradientSample(
                party.Gradient.simple(
                  party.Color.fromHex("#29aeff"),
                  party.Color.fromHex("#ffffff")
                )
            ),
        },
        rendererOptions: {
            shapeFactory: gyouzaElement,
            applyLighting: undefined,
        },
    });
}