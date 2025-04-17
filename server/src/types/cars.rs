use std::collections::HashMap;

/// Returns a static map of car product IDs to car names
pub fn get_car_map() -> HashMap<u32, &'static str> {
    HashMap::from([
        (5547, "007's Aston Martin DBS"),
        (6260, "007's Aston Martin Valhalla"),
        (1286, "Aftershock"),
        (1932, "Animus GP"),
        (625, "Armadillo"),
        (3614, "Artemis"),
        (3594, "Artemis G1"),
        (3622, "Artemis GXT"),
        (21, "Backfire"),
        (2666, "Batmobile (1989)"),
        (803, "Batmobile (2016)"),
        (7415, "Batmobile (2022)"),
        (4780, "Battle Bus"),
        (6244, "BMW M240i"),
        (1623, "Bone Shaker"),
        (22, "Breakout"),
        (1416, "Breakout Type-S"),
        (8524, "Bugatti Centodieci"),
        (9140, "Bumblebee"),
        (1919, "Centio"),
        (4472, "Chikara"),
        (4473, "Chikara G1"),
        (4367, "Chikara GXT"),
        (3031, "Cyclone"),
        (597, "DeLorean Time Machine"),
        (3426, "Diestro"),
        (5361, "Dingo"),
        (403, "Dominus"),
        (1018, "Dominus GT"),
        (4155, "Ecto-1"),
        (8360, "Emperor"),
        (8361, "Emperor II"),
        (1624, "Endo"),
        (1317, "Esper"),
        (2268, "Fast & Furious Dodge Charger"),
        (9053, "Fast & Furious Dodge Charger SRT Hellcat"),
        (2269, "Fast & Furious Nissan Skyline"),
        (5879, "Fast & Furious Pontiac Fiero"),
        (2949, "Fast 4WD"),
        (4284, "Fennec"),
        (7772, "Ferrari 296 GTB"),
        (7815, "Ford Bronco Raptor RLE"),
        (5713, "Ford F-150 RLE"),
        (6939, "Ford Mustang Mach E-RLE"),
        (6836, "Ford Mustang Shelby GT350R RLE"),
        (5265, "Formula 1 2021"),
        (7052, "Formula 1 2022"),
        (2951, "Gazella GT"),
        (26, "Gizmo"),
        (607, "Grog"),
        (3879, "Guardian"),
        (3880, "Guardian G1"),
        (3875, "Guardian GXT"),
        (4906, "Harbinger"),
        (5039, "Harbinger GXT"),
        (723, "Hogsticker"),
        (7947, "Honda Civic Type R"),
        (7948, "Honda Civic Type R-LE"),
        (29, "Hotshot"),
        (1675, "Ice Charger"),
        (1883, "Imperator DT5"),
        (3582, "Insidio"),
        (5951, "Jackal"),
        (2919, "Jurassic Jeep Wrangler"),
        (1856, "Jäger 619"),
        (4014, "K.I.T.T."),
        (3311, "Komodo"),
        (7512, "Lamborghini Countach LPI 800-4"),
        (5964, "Lamborghini Huracan STO"),
        (7532, "Maestro"),
        (7211, "Mamba"),
        (1691, "Mantis"),
        (1172, "Marauder"),
        (2313, "Mario NSR"),
        (1171, "Masamune"),
        (3155, "Maverick"),
        (3156, "Maverick G1"),
        (3157, "Maverick GXT"),
        (3265, "McLaren 570S"),
        (6247, "McLaren 765LT"),
        (30, "Merc"),
        (2950, "MR11"),
        (4318, "Mudcat"),
        (4319, "Mudcat G1"),
        (4320, "Mudcat GXT"),
        (3138, "Mystery Item"),
        (5823, "NASCAR Chevrolet Camaro"),
        (5709, "NASCAR Ford Mustang"),
        (7337, "NASCAR Next Gen Chevrolet Camaro"),
        (7338, "NASCAR Next Gen Ford Mustang"),
        (7341, "NASCAR Next Gen Toyota Camry"),
        (5773, "NASCAR Toyota Camry"),
        (1689, "Nemesis"),
        (6243, "Nexus"),
        (6489, "Nexus SC"),
        (3451, "Nimbus"),
        (9084, "Nissan Silvia"),
        (9085, "Nissan Silvia RLE"),
        (7593, "Nissan Z Performance"),
        (7336, "Nomad"),
        (7477, "Nomad GXT"),
        (23, "Octane"),
        (1568, "Otane ZSR"),
        (5020, "Outlaw"),
        (5837, "Outlaw GXT"),
        (24, "Pladin"),
        (4781, "Peregrine TT"),
        (9088, "Porsche 911 Turbo"),
        (9089, "Porsche 911 Turbo RLE"),
        (1475, "Proteus"),
        (4782, "Psyclops"),
        (5470, "R3MX"),
        (5488, "R3MX GXT"),
        (7651, "Redline"),
        (600, "Ripper"),
        (25, "Road Hog"),
        (1300, "Road Hog XL"),
        (4861, "Ronin"),
        (4864, "Ronin G1"),
        (4745, "Ronin GXT"),
        (1894, "Samurai"),
        (2298, "Samus's Gunship"),
        (404, "Scarab"),
        (4268, "Sentinel"),
        (27, "Sweet Tooth"),
        (402, "Takumi"),
        (1295, "Takumi RX-T"),
        (2665, "The Dark Knight's Tumbler"),
        (1478, "Triton"),
        (1603, "Twin Mill III"),
        (2853, "Twinzer"),
        (3702, "Tygris"),
        (5858, "Tyranno"),
        (5979, "Tyranno GXT"),
        (31, "Venom"),
        (1533, "Vulcan"),
        (8806, "Volkswagen Golf GTI"),
        (8807, "Volkswagen Golf GTI RLE"),
        (2070, "Werewolf"),
        (7696, "Whiplash"),
        (28, "X-Devil"),
        (1159, "X-Devil Mk2"),
        (523, "Zippy"),
    ])
}
