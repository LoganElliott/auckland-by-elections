import React, {PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import axios from 'axios';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {wardImagesPath} from '../../conf/conf';

injectTapEventPlugin();

require('./AddressSearcher.scss');

const koordinatesLayerId = 1349;
const koordinatesApiKey = '979e84540aac481685f1e9ea5331cc35';
const googleApiKey = 'AIzaSyAE7vD-Xl1RjQ_PPzinv2omvZy1HqiHI3c';
const componentsFiltering = 'components=country:NZ';

export default class AddressSearcher extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            ward: "",
            value: "",
            searching: false,
            addressError: '',
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
        });
    };

    handleClick() {
        this.getLatLngFromAddress(this.state.value);
    }

    handleEnter(event) {
        if(event.keyCode == 13){
            this.getLatLngFromAddress(this.state.value);
        }
    }

    onAddressSearchError(err) {
        this.setState({
            searching: false,
            ward: '',
            addressError: 'Not Valid Auckland Address'
        });
        this.props.setWard('');
        console.debug(err);
    }

    getLatLngFromAddress(address){
        this.setState({searching: true});
        axios.get('https://maps.googleapis.com/maps/api/geocode/json?region=NZ&address=' + address.trim() +'&' + componentsFiltering + '&key=' + googleApiKey)
            .then((response) => {
                let lat = response.data.results[0].geometry.location.lat;
                let lng = response.data.results[0].geometry.location.lng;

                this.getWardFromLatLng(lat,lng);
            })
            .catch((err) => this.onAddressSearchError(err));
    }

    getWardFromLatLng(lat, lng){
        axios.get('https://api.koordinates.com/api/vectorQuery.json/?key=' + koordinatesApiKey + '&layer=' + koordinatesLayerId + '&x=' + lng + '&y=' + lat)
            .then((koordinatesResponse) => {
                let ward = koordinatesResponse.data.vectorQuery.layers[koordinatesLayerId].features[0].properties.WARD_NAME;
                if(ward === 'Te Irirangi Ward'){
                    ward = 'Howick Ward';
                }
                ward = ward.replace(' Ward', '');
                this.setState({
                    ward: ward,
                    searching: false,
                    addressError: ''
                });
                this.props.setWard(ward);

            })
            .catch((err) => this.onAddressSearchError(err));
    }

    render() {

        const textFieldStyle = {
            margin: 12
        };

        const buttonStyle = {
            margin: 12
        };

        const localElectionScoreCards = {
            fontSize: '50px'
        };

        const aboutText = {
            fontSize: '18px',
            fontWeight: 300,
        };

        let infoText = <div>
                <div style={localElectionScoreCards}>
                    Auckland Election Scorecards
                </div>
                <div style={aboutText}>
                    We sat down and grilled each Auckland Council candidate one by one.
                    <br/>
                    Here are their results.
                </div>
            </div>;

        let fieldStyle = {
            color: 'rgb(93,93,93)',
        };

        let textFieldInput = <div className='field-button-container'>
            <div>
                <TextField hintText="Enter Address"
                           floatingLabelFixed={true}
                           floatingLabelStyle={fieldStyle}
                           floatingLabelText="e.g. 1 Richmond Rd Ponsonby"
                           value={this.state.value}
                           onChange={this.handleChange}
                           style={textFieldStyle}
                           errorText={this.state.addressError}
                           onKeyDown={this.handleEnter}
                />
            </div>
            <div>
                <RaisedButton label="FIND MY VOTING AREA"
                              onClick={this.handleClick}
                              style={buttonStyle}
                              className='find-my-voting-area-button'
                />
            </div>
        </div>;

        let loadingCircle = <div id="loading-bar">
            { this.state.searching ? <CircularProgress mode="indeterminate"/> : null }
        </div>;

        let searchResult = <div>
            <div className="voting-area__preamble">
                Your voting area is the
            </div>
            <div className="voting-area__ward">
                {this.state.ward.toUpperCase()} WARD
            </div>
            <div>
                <img src={wardImagesPath + this.state.ward.replace(/\s/g,'') + '.png'}></img>
            </div>
        </div>;

        return(
            <div>
                <div className='local-board-input-and-button centre-textField'>

                    {infoText}
                    {textFieldInput}
                    {loadingCircle}
                    { !this.state.searching && this.state.ward
                        ? searchResult
                        : null }
                </div>
            </div>
        );
    }

}
