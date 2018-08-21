import React, {PropTypes} from 'react'

import CircularProgress from 'material-ui/CircularProgress'
import map from 'lodash/map';
import jsonp from 'jsonp';

import Candidate from '../candidate/candidate'
import {candidateImagesPath} from '../../conf/conf';

require('./candidateCards.scss');

const googleSpreadSheetUrl = 'https://spreadsheets.google.com/a/google.com/tq?key=';
const commaSpace = '%2C%20';

const wardAndLocalBoardColumns = ['B', 'C', 'E', 'G', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y', 'AA', 'AC', 'AE', 'AG', 'AH', 'AI', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV'];
const wardAndLocalBoardGoogleSpreadSheetKey = '1te3103iZKI9E9e02lxFUd6_BKYHVTeDwfiCEzkbBgEc';
const wardAndLocalBoardQuery = wardAndLocalBoardColumns.slice(1).reduce( (pre, cur) => pre + commaSpace + cur,'SELECT%20B');
const wardAndLocalBoardsJsonpCallback = 'getWardsAndLocalBoards';
const wardAndLocalBoardsDataUrl = googleSpreadSheetUrl + wardAndLocalBoardGoogleSpreadSheetKey + '&tq=' + wardAndLocalBoardQuery + '&tqx=responseHandler:' + wardAndLocalBoardsJsonpCallback;

export default class card extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            candidates: [],
        };
    }

    componentDidMount () {
        this.getCandidates();
    }

    getCandidates(){
        let candidates = this.getCandidatesOfType(wardAndLocalBoardsDataUrl,wardAndLocalBoardsJsonpCallback);
        candidates
            .then(value => {
                let sortedCandidates = this.sortCandidates(value);
                this.setState({candidates: sortedCandidates});
            })
            .catch(err => console.debug(err));
    }

    sortCandidates (candidates) {
        return candidates.sort((a, b) => {
          if(b.overallValue === a.overallValue){
                  return (b.firstName+b.lastName).toUpperCase() < (a.firstName+a.lastName).toUpperCase()
              } else {
                  if (a.overallValue === '?' && b.overallValue !== '?'){
                    return 1;
                  }

                  if (a.overallValue !== '?' && b.overallValue === '?'){
                    return -1;
                  }

                  return b.overallValue - a.overallValue;
              }
          }
        )
    };

    getCandidatesOfType(dataUrl, callback) {
        return new Promise((resolve, reject) => {
            jsonp(dataUrl, {"name": callback}, (err, data) => {
                this.jsonpCallback(err, data)
                    .then(value => resolve(value))
                    .catch(err => reject(err));
            });
        });
    }

    jsonpCallback(err,data) {
        return new Promise((resolve, reject) => {
            if(!err){
                let rows = data.table.rows;
                let newCandidates = [];
                map(rows, (row) => {
                    let candidate = this.createCandidate(row);
                    newCandidates.push(candidate);
                });
                resolve(newCandidates)
            } else {
                reject(err);
            }
        })
    }

    createCandidate(val) {
      let scores = [];
      let transport = [];
      let housing = [];
      let environment = [];

      map(val.c.slice(2,10), (a) => {
        if(a){
          transport.push(a.v)
        }
      });
      map(val.c.slice(10,13), (a) => {
        if(a) {
          housing.push(a.v);
        }
      });
      map(val.c.slice(13,16), (a) => {
        if(a) {
          environment.push(a.v);
        }
      });
      scores.transport = transport;
      scores.housing = housing;
      scores.environment = environment;
      scores.competence = val.c[16] ? [val.c[16].v] :[];

      let firstName = val.c[0].v.trim();
      let lastName = val.c[1].v.trim();
      let image = candidateImagesPath + firstName + '-' +lastName + '.png';

      return {
        'key': firstName+lastName,
        'firstName' : firstName,
        'lastName' : lastName,
        'image': image,
        'scores': scores,
        'consensus': val.c[17] ? val.c[17].v: '',
        'overallValue': val.c[18] ? val.c[18].v : '?',
        'overall': val.c[19]  ? val.c[19].v : '?',
        'transport': val.c[20]  ? val.c[20].v : '?',
        'housing': val.c[21]  ? val.c[21].v : '?',
        'environment': val.c[22]  ? val.c[22].v : '?',
        'competence': val.c[23]  ? val.c[23].v.trim() : '?',
        'ticket': val.c[24] ? val.c[24].v.trim() : '',
        'standingForMayor': val.c[25] ? val.c[25].v : '',
        'standingForCouncillor': val.c[26] ? val.c[26].v : '',
        'standingForLocalBoard': val.c[27] ? val.c[27].v : '',
      };
    }

    render() {
        let mayorCandidates = [];
        let councillorCandidates = [];
        let localBoardCandidates = [];

        this.state.candidates.map(candidate => {
            if(candidate.standingForMayor || (candidate.standingForCouncillor && (this.props.ward == candidate.standingForCouncillor)) || (candidate.standingForLocalBoard && (this.props.localBoard == candidate.standingForLocalBoard))) {

                let candidateEl = <Candidate key={candidate.key} candidate={candidate}></Candidate>

                if(candidate.standingForMayor){
                    mayorCandidates.push(candidateEl);
                } else if(candidate.standingForCouncillor){
                    councillorCandidates.push(candidateEl);
                } else {
                    localBoardCandidates.push(candidateEl);
                }
            }
        });

        let mayor = <div className="candidates__section shadow">
            <div className="candidates__title">
                {'Scores for Mayor of Auckland'.toUpperCase()}
                </div>
            <div className="candidates__inner">
                {mayorCandidates}
            </div>
        </div>;

        let councillors = <div className="candidates__section card-3">
            <div className="candidates__title">
                {('Scores for Councillor (' + this.props.ward + ')').toUpperCase()}
            </div>
            <div className="candidates__inner">
                {councillorCandidates}
            </div>
        </div>;

        let localBoard = <div className="candidates__section card-3">
            <div className="candidates__title">
                {('Scores for ' + this.props.localBoard + ' Local Board').toUpperCase()}
            </div>
            <div className="candidates__inner">
                {localBoardCandidates}
            </div>
        </div>;

        return <div className='candidates'>
            {this.props.ward && councillorCandidates.length > 0 ? councillors : ''}
            {mayorCandidates.length > 0 ? mayor : ''}
            {this.props.localBoard && localBoardCandidates.length > 0 ? localBoard: ''}
            {this.state.candidates.length === 0 ? <CircularProgress mode="indeterminate"/> : '' }
            </div>
    }
}
