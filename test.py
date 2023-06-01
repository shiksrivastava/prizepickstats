from enum import Enum
from nba_api.stats.endpoints import playergamelogs, playergamelog
from nba_api.stats.static import players
from nba_api.stats.library.parameters import SeasonAll
import pandas as pd

def scrape():
    currentBets = pd.read_json('scrape.json')
    currentBetsPoints = currentBets[currentBets['Line'] == 'Points']
    data = {
        'imageUrls': {}
    }
    playersSeen = []
    for i in range(len(currentBetsPoints)):
        row = currentBets.iloc[i]
        if row.Name not in playersSeen:
            player_id = players.find_players_by_full_name(row.Name)[0]['id']
            url = 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/' + str(player_id) + '.png'
            data['imageUrls'][row.Name] = url
            playersSeen.append(row.Name)
    return data 


dropdown = Enum('dropdown', ['LASTNGAMES', 'REG', 'POST', 'SERIES', 'TEAM', 'OPP'])
opponent = Enum('opponent', ['ALL', 'CURR'])
stats = ['GAME_DATE', 'MATCHUP','PTS', 'REB', 'AST', 'FG3M', 'FTM', 'BLK', 'STL', 'TOV']
gridRequests = [
    {0: dropdown.LASTNGAMES, 1: 5, 2: 'Lebron James'},
    {0: dropdown.REG, 1: '2023', 2: 'Lebron James'},
    {0: dropdown.POST, 1: '2023', 2: 'Lebron James'},
    {0: dropdown.SERIES, 1: None, 2: 'Lebron James'},
    {0: dropdown.TEAM, 1: None, 2: 'Lebron James'},
    {0: dropdown.OPP, 1: 'all', 2: 'Lebron James'}
]

def convertToDf(df):
    return df.get_data_frames()[0]

def prepareReturn(df, convert=True): 
    if convert:
        df = convertToDf(df)
    df = df.copy()
    df = df[stats]
    df['PRA'] = df['PTS'] + df['REB'] + df['AST']
    df['PA'] = df['PTS'] = df['AST']
    df['PR'] = df['PTS'] + df['REB']
    df['RA'] = df['REB'] + df['AST']
    df['BS'] = df['BLK'] + df['STL']
    return df    

def getGridData(request):
    [
        dropdown, 
        spec, 
        name
    ] = request.values()
    player_id = players.find_players_by_full_name(name)[0]['id']
    match dropdown:
        case dropdown.LASTNGAMES:
            log = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Playoffs', last_n_games_nullable=spec))
            if len(log) != spec:
                log2 = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Regular Season', last_n_games_nullable=spec - len(log)))
                log = pd.concat([log, log2])
            log = prepareReturn(log, convert=False)
        case dropdown.REG:
            log = playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Regular Season')
            log = prepareReturn(log)
        case dropdown.POST:
            log = playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Playoffs')
            log = prepareReturn(log)
        case dropdown.SERIES:
            log = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_type_nullable='Playoffs', last_n_games_nullable=7))
            opp = log.iloc[0]['MATCHUP'][-3:]
            team = log.iloc[0]['TEAM_ABBREVIATION']
            log = log[log['MATCHUP'].isin([team + ' vs. ' + opp, team + ' @ ' + opp])]
            log = prepareReturn(log, convert=False)
        case dropdown.TEAM:
            log1 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star = 'Playoffs'))
            log2 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star = 'Regular Season'))
            log = pd.concat([log1, log2])
            log['TEAM_ABBREVIATION'] = log['MATCHUP'].astype(str).str[0:3]
            team = log.iloc[0]['TEAM_ABBREVIATION']
            log = log[log['TEAM_ABBREVIATION'] == team]
            log = prepareReturn(log, convert=False)
        case dropdown.OPP:
            if spec == 'all':
                log1 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star='Playoffs'))
                log2 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star='Regular Season'))
                log = pd.concat([log1, log2])
            else:
                log1 = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable=spec, season_type_nullable='Regular Season'))
                log2 = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable=spec, season_type_nullable='Playoffs'))
                log = pd.concat([log1, log2])
            log['OPP'] = log['MATCHUP'].astype(str).str[-3:]
            opp = log.iloc[0]['OPP']
            log = log[log['OPP'] == opp]
            log = prepareReturn(log, convert=False)
    return log

    # # json
    # career.get_json()

    # # dictionary
    # career.get_dict()
