--> requires ../JavaScript/lib.js for sMath.add for accurate addition
--> applications that say "// duplicate" are just there to make it easier to find applications in the object.
--> key : value  ==>  game-name : price
--> "TODO: early access" is a note for me to check if the price changes after early access ends

var OwnedApplications = {
	"20XX": 14.99
	, "3 out of 10, EP 1: \"Welcome To Shovelworks\"": 0
	, "3 out of 10, EP 1": 0 // duplicate
	, "3 out of 10, EP 2: \"Foundation 101\"": 0
	, "3 out of 10, EP 2": 0 // duplicate
	, "3 out of 10, EP 3: \"Pivot Like A Champion\"": 0
	, "3 out of 10, EP 3": 0 // duplicate
	, "3 out of 10, EP 4: \"Thank You For Being An Asset\"": 0
	, "3 out of 10, EP 4": 0 // duplicate
	, "3 out of 10, EP 5: \"The Rig Is Up!\"": 0
	, "3 out of 10, EP 5": 0 // duplicate
	, "3 out of 10: Season Two": 0
	, "3 out of 10 Season Two": 0 // duplicate
	, "A Game Of Thrones: The Board Game Digital Edition": 19.99
	, "A Game Of Thrones": 0 // duplicate
	, "A Short Hike": 7.99
	, "A Total War Saga: TROY": 49.99
	, "A Total War Saga": 0 // duplicate
	, "Absolute Drift": 11.99
	, "ABZU": 19.99
	, "Adios": 17.99
	, "AER Memories of Old": 14.99
	, "Against The Storm Royal Woodlands Demo": 0
	, "Alan Wake's American Nightmare": 8.99
	, "Alba - A Wildlife Adventure": 16.99
	, "Alba": 0 // duplicate
	, "Alder Choke DEMO": 0
	, "Alder Choke Demo": 0 // duplicate
	, "Amnesia: A Machine for Pigs": 19.99
	, "Among The Sleep - Enhanced Edition": 16.99
	, "Among Us": 4.99
	, "Ancient Enemy": 14.99
	, "Animation Throwdown: The Quest For Cards": 0
	, "Anodyne 2: Return To Dust": 19.99
	, "APE OUT": 14.99
	, "ARK Editor": 0
	, "ARK: Survival Evolved": 29.99 // 1 add-on
	, "Armored Warfare": 0
	, "Assassins Creed Syndicate": 29.99
	, "Atlas Mod Kit": 0
	, "Auto Chess": 0
	, "Auto Chess Experimental": 0
	, "Automachef": 14.99
	, "Aven Colony": 29.99
	, "Aztez": 19.99
	, "Bad North: Jotunn Edition": 14.99
	, "Bad North": 0 // duplicate
	, "Barony": 14.99
	, "Batman™ Arkham Asylum Game of the Year Edition": 19.99
	, "Batman Arkham Asylum": 0 // duplicate
	, "Batman™ Arkham City - Game of the Year Edition": 19.99
	, "Batman Arkham City": 0 // duplicate
	, "Batman™ Arkham Knight": 19.99
	, "Batman Arkham Knight": 0 // duplicate
	, "Battalion Dev Kit": 0
	, "Battle Breakers": 0
	, "Beyond CAD": 0
	, "Beyond Two Souls [Demo]": 0
	, "Beyond Two Souls Demo": 0 // duplicate
	, "Beyond Typicals": 0
	, "BioShock 2 Remastered": 19.99
	, "BioShock Infinite: Complete Edition": 54.97
	, "BioShock Remastered": 19.99
	, "BioShock 2": 0 // duplicate
	, "BioShock Infinite": 0 // duplicate
	, "BioShock": 0 // duplicate
	, "Black Widow: Recharged": 9.99
	, "Black Widow": 0 // duplicate
	, "Blair Witch": 29.99
	, "Blankos Block Party": 0
	, "Blood of steel": 0
	, "Blood of Steel": 0 // duplicate
	, "Borderlands 2": 19.99
	, "Borderlands 3": 59.99
	, "Borderlands: The Pre-Sequel": 39.99
	, "Borderlands": 0 // duplicate
	, "Brave": 0
	, "Brawlhalla": 0
	, "Bridge Constructor: The Walking Dead": 9.99
	, "Bridge Constructor": 0 // duplicate
	, "Brothers - A Tale Of Two Sons": 14.99
	, "Brothers": 0 // duplicate
	, "Bus Simulator 21 - Modding Kit": 0
	, "Bus Simulator 21 Modding Kit": 0 // duplicate
	, "Car Mechanic Simulator 2018": 19.99
	, "Carcassonne": 9.99
	, "Cave Story+": 14.99
	, "Cave Story Plus": 0 // duplicate
	, "Celeste": 19.99
	, "Centipede Recharged": 9.99
	, "Century: Age of Ashes": 0
	, "Century": 0 // duplicate
	, "Chimeraland": 0
	, "Chorus Demo": 0
	, "Cities: Skylines": 29.99
	, "City of Gangsters": 29.99
	, "Close to the Sun": 19.99
	, "Conan Exiles Dev Kit": 0
	, "Conan Exiles Mod Dev Kit Test Live": 0
	, "Control": 29.99
	, "Cook, Serve, Delicious! 3?!": 19.99
	, "Core": 0
	, "Costume Quest": 9.99
	, "Costume Quest 2": 14.99
	, "Crashlands": 14.99
	, "Crayta": 0
	, "Creature in the Well": 14.99
	, "Cris Tales": 34.99
	, "CRSED: F.O.A.D.": 0
	, "CRSED": 0 // duplicate
	, "Crying Suns": 24.99
	, "Crying Suns Demo": 0
	, "Dandara: Trials of Fear Edition": 14.99
	, "Dandara": 0 // duplicate
	, "Darksiders II Deathinitive Edition": 29.99
	, "Darksiders II": 0 // duplicate
	, "Darksiders 2": 0 // duplicate
	, "Darksiders Warmastered Edition": 19.99
	, "Darksiders": 0 // duplicate
	, "Darkwood": 13.99
	, "DARQ: Complete Edition": 19.99
	, "DARQ": 0 // duplicate
	, "Days of War Editor": 0
	, "DLC The Game - Track Editor": 0
	, "DLC The Game": 0 // duplicate
	, "Dead by Daylight": 19.99
	, "Delores: A Thimbleweed Park mini-adventure": 0
	, "Delores": 0 // duplicate
	, "DEMON'S TILT": 19.99
	, "Destiny 2: Bungie 30th Anniversary Pack": 24.99
	, "Destiny 2": 0
	, "Destroy All Humans! - Clone Carnage": 0
	, "Detroit Become Human [Demo]": 0
	, "Detroit Become Human Demo": 0 // duplicate
	, "Diabolical": 0
	, "Diesel Brothers: Truck Building Simulator Editor": 0
	, "Diesel Brothers": 0 // duplicate
	, "Discord": 0
	, "Dishonored - Definitive Edition": 19.99
	, "Dishonored®: Death of the Outsider™": 29.99
	, "Dishonored: Death of the Outsider": 0 // duplicate
	, "Dishonored": 0 // duplicate
	, "Divine Knockout (DKO)": 0
	, "Divine Knockout": 0 // duplicate
	, "Dogfight - Demo": 0
	, "Dogfight Demo": 0 // duplicate
	, "DOOM 64": 4.99
	, "Drawful 2": 9.99
	, "Dungeons 3": 29.99
	, "Duskers": 19.99
	, "Elite Dangerous": 29.99
	, "Enter the Gungeon": 14.99
	, "Epic Cheerleader Pack": 0
	, "Epistory - Typing Chronicles": 14.99
	, "Europa Universalis IV": 39.99
	, "Europa Universalis 4": 0 // duplicate
	, "EVE Online": 0
	, "Evoland Legendary Edition": 19.99
	, "Evoland": 0 // duplicate
	, "Eximius: Seize the Frontline": 29.99
	, "Eximius": 0 // duplicate
	, "Eyes in the Dark Demo": 0
	, "Faeria": 19.99
	, "Fall Guys": 0
	, "Fall Guys - Snowberry": 0
	, "Fallout 3: Game of the Year Edition": 19.99
	, "Fallout 3": 0 // duplicate
	, "Fangs": 0 // TODO: early access
	, "Far Cry 6 - Free Trial": 0
	, "Farming Simulator 19": 19.99
	, "Fault: Elder Orb": 0
	, "FTL: Faster Than Light": 9.99
	, "Faster Than Light": 0 // duplicate
	, "FTL": 0 // duplicate
	, "Fez": 9.99
	, "Figment": 19.99
	, "First Class Trouble": 14.99
	, "F.I.S.T.: Forged In Shadow Torch": 29.99
	, "FIST: Forged In Shadow Torch": 0 // duplicate
	, "F.I.S.T.": 0 // duplicate
	, "FIST": 0 // duplicate
	, "Flat Heroes Demo": 0
	, "Football Manager 2020": 54.99
	, "Football Manager 2022 Demo": 0
	, "Football Manager 2023 Demo": 0
	, "For The King": 19.99
	, "Fortnite": 0 // in-app purchases: ~$10. several battle passes. no save the world
	, "Fort Triumph": 19.99
	, "Frostpunk": 29.99
	, "Galactic Civilizations III": 24.99
	, "Galactic Civilizations 3": 0 // duplicate
	, "Galactic Civilizations III [Test branch]": 0 // doesn't exist anymore
	, "Galactic Civilizations 3 [Test branch]": 0 // duplicate
	, "Gamedec - Definitive Edition": 29.99
	, "Gamedec": 0 // duplicate
	, "Geneforge 1: Mutagen": 19.95
	, "Geneforge 1": 0 // duplicate
	, "Genshin Impact": 0
	, "Genshin": 0 // duplicate
	, "Ghost Recon Breakpoint Demo": 0
	, "Ghostbusters The Video Game Remastered": 24.99
	, "Ghostbusters The Video Game": 0 // duplicate
	, "Ghostbusters Remastered": 0 // duplicate
	, "Ghostbusters": 0 // duplicate
	, "Ghostwire: Tokyo - Prelude": 0
	, "Ghostwire: Tokyo": 0 // duplicate
	, "Ghostwire": 0 // duplicate
	, "Gloomhaven": 34.99
	, "God's Trigger": 14.99
	, "Godfall": 19.99 // not ultimate. Ultimate is $34.99 and "upgrade to ultimate" is $14.99. math. - 1¢
	, "Gods Will Fall": 14.99
	, "GOG GALAXY": 0
	, "Gone Home": 14.99
	, "GoNNer": 9.99
	, "Good Company Demo": 0
	, "Guild of Dungeoneering": 11.99 // doesn't exist anywhere. not ultimate, but ultimate is $19.99
	, "Halcyon 6 Starbase Commander": 14.99
	, "Heavy Rain [Demo]": 0
	, "Heavy Rain Demo": 0 // duplicate
	, "Helium Rain Mod Kit": 0
	, "Hell is Others": 14.99
	, "Hell is other demons": 9.99
	, "Hell Is Other Demons": 0 // duplicate
	, "Hello Mod Kit": 0
	, "Hello Neighbor Mod Kit": 0 // duplicate
	, "Hello Neighbor Hide and Seek Demo": 0
	, "Heroes & Generals WWII": 0
	, "Heroes & Generals WW2": 0 // duplicate
	, "Heroes and Generals WWII": 0 // duplicate
	, "Heroes and Generals WW2": 0 // duplicate
	, "HITMAN - Game of the Year Edition": 59.99
	, "HITMAN": 0 // duplicate
	, "Hob": 19.99
	, "Honkai Impact 3rd": 0
	, "Hood: Outlaws & Legends": 19.99
	, "Hood: Outlaws and Legends": 0 // duplicate
	, "Hood": 0 // duplicate
	, "Horace": 14.99
	, "Horizon Chase Turbo": 19.99
	, "Hue": 14.99
	, "Humble": 0
	, "Hundred Days - Winemaking Simulator": 24.99
	, "Hundred Days": 0 // duplicate
	, "Hundred Days - Winemaking Simulator DEMO": 0
	, "Hyper Light Drifter": 19.99
	, "Idle Champions of the Forgotten Realms": 0
	, "iHeart: Radio, Music, Podcasts": 0
	, "iHeart": 0 // duplicate
	, "Insurgency: Sandstorm": 29.99
	, "Insurgency": 0 // duplicate
	, "Insurmountable": 24.99
	, "Into The Breach": 14.99
	, "Iratus: Lord of the Dead": 29.99
	, "Iratus": 0 // duplicate
	, "IronCast": 14.99
	, "It Takes Two": 39.99 // owned and not owned simultaneously
	, "itch.io": 0
	, "Jotun Valhalla Edition": 14.99
	, "Jotun": 0 // duplicate
	, "Jurassic World Evolution": 44.99
	, "Just Cause 4": 29.99 // used from just cause 4 reloaded but minus 10
	, "Just Die Already": 14.99
	, "KARDS - The WWII Card Game": 0
	, "KARDS - The WW2 Card Game": 0 // duplicate
	, "KARDS": 0 // duplicate
	, "Kerbal Space Program": 39.99
	, "KID A MNESIA EXHIBITION": 0
	, "Killing Floor 2": 29.99
	, "KillingFloor2Beta": 0
	, "Killing Floor 2 Beta": 0 // duplicate
	, "Kingdom New Lands": 14.99
	, "Knockout City™": 0
	, "Knockout City": 0 // duplicate
	, "Lawn Mowing Simulator": 19.99
	, "Layers of Fear 2": 19.99
	, "League of Legends": 0
	, "LOL": 0 // duplicate
	, "LEAP Mod Editor": 0
	, "Legends of Runeterra": 0
	, "LEGO® Batman™ 2 DC Super Heroes": 19.99
	, "LEGO Batman 2": 0 // duplicate
	, "LEGO® Batman™ 3 Beyond Edition": 19.99
	, "LEGO Batman 3": 0 // duplicate
	, "LEGO® Batman™ The Videogame": 19.99
	, "LEGO Batman": 0 // duplicate
	, "LEGO® Builder's Journey": 19.99
	, "LEGO Builder's Journey": 0 // duplicate
	, "LEGO Builder's Journey": 0 // duplicate
	, "Lifeless Planet: Premier Edition": 19.99
	, "Lifeless Planet": 0 // duplicate
	, "Magic The Gathering Arena": 0
	, "Magic: Legends": 0 // early access, canceled
	, "Maneater": 39.99
	, "Mars 2030 Editor": 0
	, "MechWarrior 5 Editor": 0
	, "Might & Magic: Chess Royale": 0
	, "Might and Magic: Chess Royale": 0 // duplicate
	, "Might & Magic": 0 // duplicate
	, "Might and Magic": 0 // duplicate
	, "Minit": 9.99
	, "MONOPOLY® MADNESS DEMO": 0
	, "Monopoly® Madness Demo": 0 // duplicate
	, "Mortal Shell": 29.99
	, "Mortal Shell Tech Beta": 0 // TODO: idk what this is or where it came from
	, "MudRunner": 19.99
	, "MultiVersus": 0
	, "N0va Desktop": 0
	, "NAIRI Rising Tide": 0 // coming soon
	, "NASA XOSS MarsXR Editor": 0
	, "NBA 2k21": 59.99
	, "NBA 2021": 0 // duplicate
	, "Never Alone (Kisima Ingitchuna)": 14.99
	, "Never Alone": 0 // duplicate
	, "NeverWinter": 0
	, "Next Up Hero": 19.99
	, "Night in the Woods": 19.99
	, "Nioh: The Complete Edition": 49.99
	, "Nioh": 0 // duplicate
	, "No Straight Roads Mother and Child Demo": 0
	, "Nova Lands: Emilia's Mission Demo": 0
	, "Nuclear Throne": 11.99
	, "Offworld Trading Company": 29.99
	, "OHDcore Mod Kit": 0
	, "Opera GX - The First Browser for Gamers": 0
	, "Opera GX": 0 // duplicate
	, "Overcooked": 16.99
	, "Overcooked! 2": 24.99
	, "Outplayed": 0
	, "Paladins": 0
	, "Paradigm": 14.99
	, "Paragon: The Overprime": 0 // TODO: early access
	, "Path of Exile": 0
	, "Pathway": 15.99
	, "Phantasy Star Online 2 New Genesis": 0
	, "Phantasy Star Online 2": 0 // duplicate
	, "Pikuniku": 12.99
	, "Pinball FX": 0
	, "Post Scriptum Modding SDK": 0
	, "Prey": 39.99
	, "Primordials: Battle of Gods": 0
	, "Primordials": 0 // duplicate
	, "Prison Architect": 29.99
	, "PUBG BATTLEGROUNDS": 0
	, "PUBG Founder's Pack": 0
	, "Rage 2": 39.99
	, "Rise of Industry": 29.99
	, "Railway Empire": 29.99
	, "Rainbow Six Extraction Demo": 0
	, "Ravenous Devils": 4.99
	, "Rayman Legends": 29.99
	, "Razer Cortex": 0
	, "Realm Royale Reforged": 0
	, "Rebel Galaxy": 19.99
	, "Recipe For Disaster": 16.99
	, "Redout: Enhanced Edition": 19.99
	, "Redout": 0 // duplicate
	, "Relicta": 19.99
	, "Remnant: From the Ashes": 39.99
	, "Remnant": 0 // duplicate
	, "Ring of Pain": 19.99
	, "Rise of the Tomb Raider: 20 Year Celebration": 29.99
	, "Rise of the Tomb Raider": 0 // duplicate
	, "Rising Hell": 9.99
	, "Rising Storm 2: Vietnam": 24.99
	, "Rising Storm 2": 0 // duplicate
	, "Rocket League®": 0
	, "Rocket League": 0 // duplicate
	, "Rogue Company": 0
	, "Rogue Legacy": 14.99
	, "Roller Champions™": 0
	, "Roller Champions": 0 // duplicate
	, "RollerCoaster Tycoon® 3: Complete Edition": 19.99
	, "RollerCoaster Tycoon 3": 0 // duplicate
	, "RPG in a Box": 29.99
	, "rpg in a Box": 0 // duplicate
	, "Rumbleverse™": 0
	, "Rumbleverse": 0 // duplicate
	, "Rumbleverse™ - Boom Boxer Content Pack": 0
	, "Rumbleverse - Boom Boxer Content Pack": 0 // duplicate
	, "Runbow": 14.99
	, "Saints Row Boss Factory": 0
	, "Saints Row IV Re-Elected": 19.99
	, "Saints Row 4 Re-Elected": 0 // duplicate
	, "Saints Row 4": 0 // duplicate
	, "Saints Row The Third Remastered": 39.99
	, "Saints Row The Third": 0 // duplicate
	, "Saturnalia": 19.99
	, "SAMURAI SHODOW NEOGEO COLLECTION": 39.99
	, "Scavengers": 0
	, "Second Extinction™": 24.99
	, "Second Extinction": 0 // duplicate
	, "Severed Steel": 24.99
	, "Shadow of the Tomb Raider: Definitive Edition": 39.99
	, "Shadow of the Tomb Raider": 0 // duplicate
	, "Shadow Tactics: Blades of the Shogun": 39.99
	, "Shadow Tactics": 0 // duplicate
	, "Shadow Tactics - Aiko's Choice": 19.99 // standalone paid dlc
	, "Shadow Tactics: Blades of the Shogun - Aiko's Choice": 0 // duplicate
	, "Shadowrun Hong Kong - Extended Edition": 19.99
	, "Shadowrun Hong Kong": 0 // duplicate
	, "Shadowrun Returns": 14.99
	, "Shadowrun: Dragonfall - Director's Cut": 14.99
	, "Shadowrun: Dragonfall": 0 // duplicate
	, "Shadowrun": 0 // duplicate
	, "Sheltered": 14.99
	, "Sherlock Holmes Crimes and Punishments": 29.99
	, "Shop Titans": 0
	, "Sid Meier's Civilization® VI": 59.99 // 1 add-on
	, "Sid Meier's Civilization VI": 0 // duplicate
	, "Sid Meier's Civilization 6": 0 // duplicate
	, "Civilization VI": 0 // duplicate
	, "Civilization 6": 0 // duplicate
	, "Slain: Back From Hell": 12.99
	, "Slain": 0 // duplicate
	, "Sludge Life": 14.99
	, "SMITE": 0
	, "Solitairica": 9.99
	, "Sonic Mania": 19.99
	, "Space Punks": 0
	, "Speed Brawl": 19.99
	, "Spellbreak": 0
	, "SpellForce 3: Versus Edition": 0
	, "SpellForce 3": 0 // duplicate
	, "Spirit of the North": 19.99
	, "Spotify Music": 0
	, "Spotify": 0 // duplicate
	, "Squad Editor": 0
	, "Star Stable Online": 0
	, "Star Trek Online": 0
	, "STAR WARS™ Battlefront™ II: Celebration Edition": 39.99
	, "STAR WARS Battlefront II": 0 // duplicate
	, "STAR WARS Battlefront 2": 0 // duplicate
	, "Battlefront II": 0 // duplicate
	, "Battlefront 2": 0 // duplicate
	, "SteelSeries© FREE Cosmetic Pack": 0
	, "Steep": 29.99
	, "STG Football": 0 // TODO: early access
	, "Stick it to the Man": 7.99
	, "Stanger Things 3: The Game": 19.99 // not available
	, "Stubbs the Zombie in Rebel Without a Pulse": 19.99
	, "Submerged: Hidden Depths": 29.99
	, "Submerged": 0 // duplicate
	, "SuchArt: Creative Space": 0 // doesn't exist. free on steam
	, "Sundered: Eldrich Edition": 19.99
	, "Sundered": 0 // duplicate
	, "Sunless Sea": 18.99
	, "Super Squad": 0
	, "Superbrothers: Sword & Sworcery EP": 7.99
	, "Superbrothers": 0 // duplicate
	, "SUPERHOT": 24.99
	, "SUPERHOT: Mind Control Delete": 24.99
	, "Supraland": 19.99
	, "Surviving Mars": 29.99
	, "Swords of Legends Online": 0
	, "Tacoma": 19.99
	, "Tales of the Neon Sea": 16.99
	, "Tannenburg": 19.99
	, "Teamfight Tactics": 0
	, "TFT": 0 // duplicate
	, "Terraforming Mars": 19.99
	, "Tharsis": 14.99
	, "The Alien Cube - Demo": 0
	, "The Alien Cube Demo": 0 // duplicate
	, "The Alto Collection": 9.99
	, "The Bridge": 9.99
	, "The Bunny Graveyard DEMO": 0
	, "The Captain": 19.99
	, "The Cycle: Frontier": 0
	, "The Cycle": 0 // duplicate
	, "The Drone Racing League Simulator": 9.99
	, "The Escapists": 17.99
	, "The Escapists 2": 19.99
	, "The Fall": 9.99
	, "The Last Friend: First Bite": 14.99
	, "The Last Friend": 0 // duplicate
	, "The Messenger": 19.99
	, "The Riftbreaker Prologue Demo": 0
	, "The Sims™ 4": 0
	, "The Sims 4": 0 // duplicate
	, "The Spectrum Retreat": 12.99
	, "The Stanley Parable": 14.99
	, "The Talos Principle": 39.99
	, "The Textorcist: The Story of Ray Bibbia": 14.99
	, "The Textorcist": 0 // duplicate
	, "The Vanishing of Ethan Carter": 19.99
	, "The Vanishing of Ethan Carter Redux": 0
	, "The World Next Door": 9.99
	, "the Hunter: Call of the Wild™ - New England Mountains Scout Cosmetic Pack": 0
	, "the Hunter - New England Mountains Scout Cosmetic Pack": 0 // duplicate
	, "the Hunter": 0 // duplicate
	, "theHunter: Call of the Wild™": 19.99
	, "theHunter": 0 // duplicate
	, "theHunter - New England Mountains Scout Cosmetic Pack": 0 // duplicate
	, "Them's Fightin' Herds": 19.99
	, "Thunder Tier One Modding Tool": 0
	, "Ticket to Ride": 9.99
	, "TIDAL Music": 0
	, "ToeJam & Earl: Back in the Groove!": 14.99
	, "ToeJam and Earl: Back in the Groove!": 0 // duplicate
	, "ToeJam & Earl": 0 // duplicate
	, "ToeJam and Earl": 0 // duplicate
	, "Tomb Raider GAME OF THE YEAR EDITION": 19.99
	, "Tomb Raider": 0 // duplicate
	, "Torchlight II": 19.99
	, "Torchlight 2": 0 // duplicate
	, "Tormentor X Punisher": 7.99
	, "Totally Reliable Delivery Service": 14.99
	, "Towerfall Ascencion": 19.99
	, "Trackmania": 0
	, "Tropico 5": 19.99
	, "True Fear: Forsaken Souls Part 1 Demo": 0
	, "UnMetal Demo": 0
	, "Unrailed!": 19.99
	, "Unreal Tournament": 0
	, "UT Editor": 0
	, "VALORANT": 0
	, "Vertical Third Tech Demo": 0
	, "Video Horror Society": 0
	, "VR Funhouse Editor": 0
	, "Warface": 0
	, "Warframe": 0
	, "Wargame: Red Dragon": 29.99
	, "Wargame": 0 // duplicate
	, "Warhammer 40,000: Mechanicus": 29.99
	, "Warhammer 40,000": 0 // duplicate
	, "Warhammer 40000": 0 // duplicate
	, "Warhammer": 0 // duplicate
	, "Warpips": 16.99
	, "Watch Dogs 2: Standard Edition": 59.99
	, "Watch Dogs 2": 0 // duplicate
	, "Wheels of Aurelia": 14.99
	, "Where the Water Tastes Like Wine": 19.99
	, "while True: learn()": 12.99
	, "Wildcat Gun Machine": 14.99
	, "Wilmot's Warehouse": 14.99
	, "Windbound": 19.99
	, "Wolfenstein: The New Order": 19.99
	, "Wolfenstein": 0 // duplicate
	, "Wonder Boy: The Dragon's Trap": 19.99
	, "Wonder Boy": 0 // duplicate
	, "World of Goo": 14.99
	, "World of Warships": 0
	, "World War Z": 19.99
	, "XCOM® 2": 59.99
	, "XCOM 2": 0 // duplicate
	, "Yoku's Island Express": 19.99
	, "Yooka-Laylee and the Impossible Lair": 29.99
	, "Zorya: The Celestial Sisters Friend Pass": 0
},

accountWorth = `$${Object.values(OwnedApplications).filter(
	e => e && ["num", "int"].incl(type(e,1)) // in case I decide to change how the duplicates ...
	// ... are displayed, and instead make them a string or something.
).reduce(
	(t, x) => sMath.add(t, x),
	"0.0"
)} USD`.replace(/\.(\d) /, ".$10 "),

appsInclude = app => OwnedApplications[app] ?? !1;
