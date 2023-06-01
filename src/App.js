import React, { useEffect, useState } from 'react';
import CloseButton from 'react-bootstrap/CloseButton';
import ReactModal from 'react-modal';
import map from 'lodash/map';
import styled from 'styled-components';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'bootstrap/dist/css/bootstrap.css';
import Table from 'react-bootstrap/Table';
import { flexbox } from '@mui/system';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { optionClasses } from '@mui/base';
import { BarChart, ReferenceLine, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];


// Styled Components
const Banner = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  padding-left: 20px;
  padding-right: 15px;
  background-color: #333;
  color: #fff;
`;

const BoxStyle = styled.header`
  position: 'absolute' as 'absolute';
  top: '50%';
  left: '50%';
  transform: 'translate(-50%, -50%)';
  width: 400;
  bgcolor: 'background.paper';
  border: '2px solid #000';
  boxShadow: 24;
  p: 4;
`;

const Tab = styled.button`
  font-size: 15px;
  padding: 10px 30px;
  cursor: pointer;
  opacity: 0.6;
  background: white;
  border: 0;
  outline: 0;
  ${({ active }) =>
    active &&
    `
    border-bottom: 2px solid black;
    opacity: 1;
  `}
`;
const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 20px;
  padding-left: 50px;
  padding-right: 50px;
`;

const Title = styled.h1`
  font-size: 24px;
`;

const SportButtonsContainer = styled.div`
  display: flex;
`;

const SportButton = styled.button`
  background-color: ${(props) => (props.selected ? '#888' : '#555')};
  color: #fff;
  font-size: 16px;
  border-radius: 5px;
  padding: 10px 15px;
  border: none;
  outline: none;
  cursor: pointer;
  margin-left: 10px;

  &:first-child {
    margin-left: 0;
  }
`;

const TilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px -10px;
  padding: 20px;
  padding-left: 95px;
`;

const Tile = styled.div`
  display: flex;
  border-radius: 5px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 10px;
  border: 1px solid black;
  background-color: #f5f5f5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  min-height: 300px;
  min-width: 250px;
  &:hover {
    transform: translateY(-5px);
  }
`;

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding-bottom: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;

const TileImage = styled.img`
  width: 50%;
  height: 100px;
  object-fit: cover;
  padding-top: 20px;
`;

const ModalImage = styled.img`
  width: 100%,
  height: 100px;
  object-fit: cover;
  padding-bottom: 20px;
`;

const TileContent = styled.div`
  padding: 20px;
`;


const LineContainer = styled.button`
  margin-top: 30px;
  background-color: #cfcfcf;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  min-width: 200px;
  border-radius: 5px;
  min-height: 40px;
`;

const TileTitle = styled.h3`
  font-size: 18px;
`;

const TileDescription = styled.p`
  font-size: 14px;
  color: #555;
`;

const TileDescriptionSep = styled.p`
  font-size: 30px;
  color: #555;
`;

const Stats = styled.p`
  display: flex;
  justify-content: flex-end;  
`;
const dropdownOptions = [
  {
    value: 'LASTNGAMES',
    label: 'Last N Games',
  },
  {
    value: 'REG',
    label: 'Regular Season',
  },
  {
    value: 'POST',
    label: 'Playoffs',
  },
  {
    value: 'SERIES',
    label: 'Latest series',
  },
  {
    value: 'TEAM',
    label: 'Since joining team',
  },
  {
    value: 'OPP',
    label: 'Against opponent',
  }
];

function App() {
  const [imageUrls, setImageUrls] = useState({});
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [selectedCategory, setSelectedCategory] = useState("PTS");
  const [lines, setLines] = useState({});
  const [show, setShow] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState('Jimmy Butler');
  const [filter, setFilter] = useState(dropdownOptions[0].value);
  const [filterLabel, setFilterLabel] = useState(dropdownOptions[0].label);
  const [spec, setSpec] = useState(5);
  const [log, setLog] = useState({});
  const [chartData, setChartData] = useState([]);
  const [resultText, setResultText] = useState('');

  useEffect(() => {
    fetch('http://localhost:42069/api/' + String(selectedCategory))
      .then(response => response.json())
      .then(data => {
        setImageUrls(data['imageUrls']);
        setLines(data['lines']);
      });
  }, [selectedCategory]);

  useEffect(() => {
    fetch('http://localhost:42069/fesh/' + selectedTile)
      .then(response => response.json())
      .then(data => {
        setLog(data['log']);
        setChartData(getChartData(data['target']))
      });
  }, [selectedTile]);


  const sports = [
    { name: 'NBA', icon: '🏀', enabled: true },
    { name: 'NFL', icon: '🏈' },
    { name: 'MLB', icon: '⚾️' },
    { name: 'Other', icon: '🏅' },
  ];
  const nGamesOptions = Array.from(Array(100).keys()).map(n => {
    return {
      label: n,
      value: n
    };
  });

  const getChartData = (data) => {
    let count = 0;
    let total = 0;
    const toReturn = Object.keys(data).map((key, index) => {
      if (Number(data[key]) > Number(lines[selectedPlayer][0])) {
        count += 1;
      }
      total += 1;
      return {
        score: data[key]
      };
    });
    setResultText(String(count) + "/" + String(total) + " games hit");
    return toReturn;
  };

  const types = ['PTS', 'PRA', 'REB', 'AST', 'FG3M', 'PR', 'PA', 'RA', 'FTM', 'BS','BLK', 'STL', 'TOV'];
  const typePrettify = {
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
  };

  // const setShowFalse = () => {
  //   setShow(false);
  // };
  // const setShowTrue = () => {
  //   setShow(true);
  // }

  const handleModalOpen = (key) => {
    setSelectedPlayer(String(key));
    setLog({});
    setSelectedTile(String(key) + '/' + String(selectedCategory) + '/' + String(filter) + '/' + String(spec));
    setShow(true);
  };

  const handleModalClose = () => {
    setShow(false);
    setFilter(dropdownOptions[0].value);
    setFilterLabel(dropdownOptions[0].label);
    setSpec(5);
    setLog({});
  }

  const handleFilterTypeSelect = option => {
    setFilter(option.value);
    setFilterLabel(option.label);
    let opp = String(spec);
    if (option.value == 'OPP') {
      opp = String(lines[selectedPlayer][1]);
    };
    setSelectedTile(String(selectedPlayer) + '/' + String(selectedCategory) + '/' + String(option.value) + '/' + opp);
  }

  const handleNGamesSelect = option => {
    setSpec(option.value);
    setSelectedTile(String(selectedPlayer) + '/' + String(selectedCategory) + '/' + String(filter) + '/' + String(option.value));
  }

  return (
    <div className="App">
      <Banner>
        <Title>PRIZEPICK STATS</Title>
        <SportButtonsContainer>
          {sports.map((sport) => (
            <SportButton
              key={sport.name}
              selected={selectedSport === sport.name}
              onClick={() => sport.enabled ? setSelectedSport(sport.name) : null}
            >
              {sport.icon}
            </SportButton>
          ))}
        </SportButtonsContainer>
      </Banner>
      <>
      <ButtonGroup>
        {types.map(type => (
          <Tab
            key={type}
            active={selectedCategory === type}
            onClick={() => setSelectedCategory(type)}
          >
            {typePrettify[type]}
          </Tab>
        ))}
      </ButtonGroup>
    </>
      <TilesContainer>
        {map(Object.keys(lines), (key, index) => (
          <Tile>
          <TileImage src={imageUrls[key]} alt="" />
          <TileContent>
            <TileTitle>{key}</TileTitle>
            <TileDescription>{lines[key][2]}</TileDescription>
            <TileDescription>vs {lines[key][1]}</TileDescription>
            <LineContainer onClick={() => handleModalOpen(key)}>
              <TileDescription>{lines[key][0]}</TileDescription>
              <TileDescription>{typePrettify[selectedCategory]}</TileDescription>
            </LineContainer>
          </TileContent>
        </Tile>
        ))}
      </TilesContainer>
      <ReactModal
        isOpen={show}
        onRequestClose={() => handleModalClose()} // Close the modal when requested
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true} // Close the modal when clicking outside
        onAfterClose={() => handleModalClose()}
      >
        <div>
          <Stats>
            <CloseButton onClick={() => handleModalClose()}/>
          </Stats>
          <DropdownContainer>
            <DropdownButton id="filterType" title={filterLabel}>
              {dropdownOptions.map((option, i) => {
                return (
                  <Dropdown.Item onClick={() => handleFilterTypeSelect(option)} key={i}>{option.label}</Dropdown.Item>
                );
              })}
            </DropdownButton>
            {filter == 'LASTNGAMES' && (<DropdownButton id="ngames" title={spec}>
              <Dropdown.Menu style={{ overflowY: 'scroll', maxHeight: 500}}>
                {nGamesOptions.map((option, i) => {
                    return (
                      <Dropdown.Item onClick={() => handleNGamesSelect(option)} key={i}>{option.label}</Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
            </DropdownButton>)}
          </DropdownContainer>
          <ModalHeader>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <ModalImage src={imageUrls[selectedPlayer]} alt="" />
              <div>{lines[selectedPlayer] ? lines[selectedPlayer][2] : ''}</div>
              <div>vs. {lines[selectedPlayer] ? lines[selectedPlayer][1] : ''}</div>
            </div>
            <BarChart
              width={750}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, Number(lines[selectedPlayer] ? lines[selectedPlayer][0] : 0) + 5]}/>
              <ReferenceLine y={lines[selectedPlayer] ? lines[selectedPlayer][0] : 0} label={{ position: 'right',  value: lines[selectedPlayer] ? lines[selectedPlayer][0] : '', fill: 'red', fontSize: 14 }} stroke="red" />
              <Tooltip />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
            <TileTitle>
              {resultText}
            </TileTitle>
          </ModalHeader>
          <Table hover className="w-auto">
            <thead>
              <tr>
                <th>Game Date</th>
                <th>{filter == 'OPP' ? 'Matchup' : 'Opponent'}</th>
                <th style={{ backgroundColor: "#90EE90"}}>{typePrettify[selectedCategory]}</th>
                {types.filter(type => type != selectedCategory).map(type => {
                  return (
                    <th>{typePrettify[type]}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {log != null && log.AST != null && Object.keys(log.AST).map(row => {
                return (
                  <tr style={{ backgroundColor: Number(log[selectedCategory][row]) > lines[selectedPlayer][0] ? "#90EE90" : "white"}}>
                    <td>{log.GAME_DATE[row]}</td>
                    <td>{log.MATCHUP[row]}</td>
                    <td>{log[selectedCategory][row]}</td>
                    {types.filter(type => type != selectedCategory).map(type => {
                      return (
                        <td>{log[type][row]}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </ReactModal>

    </div>
  );
}

export default App;