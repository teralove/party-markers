module.exports = function PartyMarkers(mod) {    
    let partyMembers = [];
    let markers = [];
    let updateDelayTimer;
    
    mod.command.add('partymarkers', (arg) => {
        if (arg) arg = arg.toLowerCase();
        
        if (['off', 'disable'].includes(arg)) {
            mod.settings.enabled = false;
        } else if (['on', 'enable'].includes(arg)) {
            mod.settings.enabled = true;
        } else {
            mod.settings.enabled = !mod.settings.enabled;
        }
                
        if (!mod.settings.enabled) {
            markers = [];
        }
        UpdateMarkers();
        
        mod.command.message((mod.settings.enabled) ? 'Enabled' : 'Disabled');
    });
    
    mod.hook('S_LOGIN', 13, (event) => {
        partyMembers = [];
        markers = [];
    });
    
    mod.hook('S_LEAVE_PARTY', 1, (event) => {
        partyMembers = [];
        markers = [];
    });
    
    mod.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
        partyMembers = event.members;
    })
            
    mod.hook('S_SPAWN_USER', 14, (event) => {
        if (partyMembers.length == 0) return; // you must be in a party
        
        let job = (event.templateId  - 10101) % 100
        
        if (IsInYourParty(event.gameId)) {
            for(let markerColor in mod.settings.allyTargets) {
                if (mod.settings.allyTargets[markerColor].includes(job)) {
                    if (!MarkerExists(event.gameId)) {
                        markers.push({color: markerColor, target: event.gameId});
                        break;
                    }
                }
            }
        }
        else {
            for(let markerColor in mod.settings.enemyTargets) {
                if (mod.settings.enemyTargets[markerColor].includes(job)) {
                    if (!MarkerExists(event.gameId)) {
                        markers.push({color: markerColor, target: event.gameId});
                        break;
                    }
                 }
            }
        }
        if (mod.settings.enabled) UpdateMarkers();
        
    });
    
    function UpdateMarkers() {
        if (updateDelayTimer) clearTimeout(updateDelayTimer);
        updateDelayTimer = setTimeout(() => {
            mod.send('S_PARTY_MARKER', 1, { markers: markers });
        }, 1000);
    }
    
    function MarkerExists(id) {
        if (markers.find(m => m.target == id)) return true;
        return false;
    }
    
    function IsInYourParty(id) {
        if (partyMembers.find(m => m.gameId == id)) return true;
        return false;
    }
}
