module.exports = function PartyMarkers(dispatch) {
	const command = dispatch.command || dispatch.require.command;
    /*
    class index
    warrior = 0, lancer = 1, slayer = 2, berserker = 3,
    sorcerer = 4, archer = 5, priest = 6, mystic = 7,
    reaper = 8, gunner = 9, brawler = 10, ninja = 11,
    valkyrie = 12
    */

    /*
    marker colors
    0 = red, 1 = yellow, 2 = blue
    */

    // Targets in your party
    const AllyTargets = {
        0: [],      //red
        1: [1, 10], //yellow
        2: [6, 7]   //blue
    };
    
    // Targets NOT in your party
    const EnemyTargets = {
        0: [6, 7],  //red
        1: [],      //yellow
        2: []       //blue
    };
    
    let partyMembers = [];
    let enabled = true;
    let markers = [];
    let updateDelayTimer;
    
    command.add('partymarkers', () => {
        enabled = !enabled;
        if (!enabled) {
            markers = [];
        }
        UpdateMarkers();
        let txt = (enabled) ? 'enabled' : 'disabled';
        command.message('party-markers ' + txt);
    });
    
    dispatch.hook('S_LOGIN', 13, (event) => {
        partyMembers = [];
        markers = [];
    });
    
    dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
        partyMembers = [];
        markers = [];
    });
    
    dispatch.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
        partyMembers = event.members;
    })
    
    dispatch.hook('S_SPAWN_USER', 13, (event) => {
        if (!enabled) return;
        if (partyMembers.length == 0) return; // you must be in a party
        
        let job = (event.templateId  - 10101) % 100
        
        if (IsInYourParty(event.gameId)) {
            for(let markerColor in AllyTargets) {
                if (AllyTargets[markerColor].includes(job)) {
                    if (!MarkerExists(event.gameId)) {
                        markers.push({color: markerColor, target: event.gameId});
                        break;
                    }
                }
            }
        }
        else {
            for(let markerColor in EnemyTargets) {
                if (EnemyTargets[markerColor].includes(job)) {
                    if (!MarkerExists(event.gameId)) {
                        markers.push({color: markerColor, target: event.gameId});
                        break;
                    }
                 }
            }
        }
        UpdateMarkers();
        
    });
    
    function UpdateMarkers() {
        if (updateDelayTimer) clearTimeout(updateDelayTimer);
        updateDelayTimer = setTimeout(() => {
            dispatch.toClient('S_PARTY_MARKER', 1, { markers: markers });
        }, 1000);
    }
    
    function MarkerExists(id) {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].target == (id)) {
                return true;
            }
        }
        return false;
    }
    
    function IsInYourParty(id) {
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].gameId == (id)) {
                return true;
            }
        }
        return false;
    }
}
