from flask import Flask, jsonify, send_from_directory
from enum import Enum
from nba_api.stats.endpoints import playergamelogs, playergamelog
from nba_api.stats.static import players
from nba_api.stats.library.parameters import SeasonAll
from flask_cors import CORS, cross_origin
import json


dropdownEnum = Enum('dropdown', ['LASTNGAMES', 'REG', 'POST', 'SERIES', 'TEAM', 'OPP'])
opponent = Enum('opponent', ['ALL', 'CURR'])
stats = ['GAME_DATE', 'MATCHUP','PTS', 'REB', 'AST', 'FG3M', 'FTM', 'BLK', 'STL', 'TOV']
typePrettify = {
    'PTS': 'Points',
    'PRA': 'Pts+Rebs+Asts',
    'REB': 'Rebounds',
    'AST': 'Assists',
    'FG3M': '3-PT Made',
    'PR': 'Pts+Rebs',
    'PA': 'Pts+Asts',
    'RA': 'Rebs+Asts',
    'FTM': 'Free Throws Made',
    'BS': 'Blks+Stls',
    'BLK': 'Blocks',
    'STL': 'Steals',
    'TOV': 'Turnovers'
}
import pandas as pd

app = Flask(__name__, static_folder='frontend/build')
CORS(app, resources=[r'/api/*', r'/fesh/*'], headers='Content-Type')


@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/<cat>')
@cross_origin()
def api(cat):
    df = pd.read_json('scrape.json')
    currentBets = df[df['Line'] == typePrettify[cat]]
    data = {'imageUrls': {}, 'lines': {}}
    playersSeen = []
    for i in range(len(currentBets)):
        row = currentBets.iloc[i]
        if row.Name not in playersSeen:
            player_id = players.find_players_by_full_name(row.Name)[0]['id']
            url = 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/' + str(player_id) + '.png'
            data['imageUrls'][row.Name] = url
            playersSeen.append(row.Name)
        data['lines'][row.Name] = [row.Prop, row.Opp[-3:], row.Date]
    return jsonify(data)

def convertToDf(df):
    return df.get_data_frames()[0]

def prepareReturn(df, convert=True): 
    if convert:
        df = convertToDf(df)
    df = df.copy()
    df = df[stats]
    df['PRA'] = df['PTS'] + df['REB'] + df['AST']
    df['PA'] = df['PTS'] + df['AST']
    df['PR'] = df['PTS'] + df['REB']
    df['RA'] = df['REB'] + df['AST']
    df['BS'] = df['BLK'] + df['STL']
    return df 

@app.route('/fesh/<name>/<category>/<dropdown>/<spec>')
@cross_origin()
def fesh(name, category, dropdown, spec):
    player_id = players.find_players_by_full_name(name)[0]['id']
    match dropdown:
        case 'LASTNGAMES':
            log = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Playoffs'))
            log = log.head(int(spec))
            if int(len(log)) != int(spec):
                log2 = convertToDf(playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Regular Season'))
                log2 = log2.head(int(spec) - len(log))
                log = pd.concat([log, log2])
            log = prepareReturn(log, convert=False)
        case 'REG':
            log = playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Regular Season')
            log = prepareReturn(log)
        case 'POST':
            log = playergamelogs.PlayerGameLogs(player_id_nullable=player_id, season_nullable='2022-23', season_type_nullable='Playoffs')
            log = prepareReturn(log)
        case 'SERIES':
            log = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season_type_all_star='Playoffs'))
            log = log.head(7)
            opp = str(log.iloc[0]['MATCHUP'])[-3:]
            team = str(log.iloc[0]['MATCHUP'])[0:3]
            log = log[log['MATCHUP'].isin([team + ' vs. ' + opp, team + ' @ ' + opp])]
            log = prepareReturn(log, convert=False)
        case 'TEAM':
            log1 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star = 'Playoffs'))
            log2 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star = 'Regular Season'))
            log = pd.concat([log1, log2])
            log['TEAM_ABBREVIATION'] = log['MATCHUP'].astype(str).str[0:3]
            team = log.iloc[0]['TEAM_ABBREVIATION']
            log = log[log['TEAM_ABBREVIATION'] == team]
            log = prepareReturn(log, convert=False)
        case 'OPP':
            log1 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star='Playoffs'))
            log2 = convertToDf(playergamelog.PlayerGameLog(player_id=player_id, season='ALL', season_type_all_star='Regular Season'))
            log = pd.concat([log1, log2])
            log['OPP'] = log['MATCHUP'].astype(str).str[-3:]
            log = log[log['OPP'] == spec]
            log = prepareReturn(log, convert=False)
    if dropdown != 'OPP':
        log['MATCHUP'] = log['MATCHUP'].astype(str).str[-3:]
    log['GAME_DATE'] = pd.to_datetime(log['GAME_DATE'])
    log['GAME_DATE'] = log['GAME_DATE'].astype(str)
    log[category]
    log.reset_index(inplace=True)
    data = {'log': json.loads(log.to_json()), 'target': json.loads(log[category].to_json())}
    return jsonify(data)


if __name__ == '__main__':
    app.run(port=42069)

