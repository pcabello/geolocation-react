import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      directionList: []
    }

    this.ShowMap = this.ShowMap.bind(this);
    this.UpdateDirection = this.UpdateDirection.bind(this);
  }


  UpdateDirection(lat, long, locationType) {
    var aux = [];
    aux[locationType] = this.state.directionList;
    aux[locationType].push([lat,long]);

    this.setState({
      directionList: aux[locationType]
    });

    console.log(this.state.directionList);
  }

  ShowMap(directions) {
    return <GeoMapa directions={directions}/>
  }

  render() {
    const hasDirections = this.state.directionList.length
    return (
      <div>
       <GeoAdd UpdateDirection={this.UpdateDirection}/>
        {
          (hasDirections > 0) ?
            this.ShowMap(this.state.directionList)
           : null
        }
      </div>
    )
  }
}

class GeoAdd extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: '',
      myLocation: false,
      validateInput: false
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleMyLocation = this.handleMyLocation.bind(this);
    this.findLocation = this.findLocation.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    let field = this.state.value.trim();
    if (!field) {
      return
    } else {
      this.Validate(this.state.value);
    }
  }

  Validate(value) {
    var reg = /^(www.)?([a-zA-Z0-9]+).[a-zA-Z0-9]*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
        result =  reg.test(value),
        validate = '';

    if(result) {
      this.findLocation('site_location');

      validate = false;
    }
    else {
      validate = true;
      return;
    }

    this.setState ({
      validateInput: validate
    })
  }

  handleMyLocation() {

    this.setState({
      value: '',
      myLocation: true
    }, function() {
      this.findLocation('my_location');
    });

  }

  findLocation(locationType) {
    const that = this.props;

    axios.get('http://ip-api.com/json/' + this.state.value).then(function(response){
       if(response.status !== 'fail') {
         const jsonResponse = response.request.response;
         const parsed = JSON.parse(jsonResponse);
         that.UpdateDirection(parsed.lat, parsed.lon, locationType);

       } else {
         return;
       }
     }).catch(function(error) {

     });
  }


  render() {
    const inputError = {
      border: '1px solid red',
      color: 'red'
    };

    return (
      <div className="geo__container__header">
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={this.state.value} onChange={this.handleChange} className="field--default" required={true} style={this.state.validateInput ? inputError : null} />
          <input type="submit" value="Site Location" className="btn--submit"/>
        </form>
        <GeoMyLocation handleMyLocation={this.handleMyLocation} disable={this.state.myLocation}/>
      </div>
    )
  }
}

class GeoMyLocation extends React.Component {
  render() {
    return (
      <div className="geo_my_location">
        <input type="button" value="My Location" onClick={this.props.handleMyLocation} className="btn--location" />
      </div>
    )
  }
}

class GeoClear extends React.Component {
  render() {
    return (
      <div className="geo_clear_location">
          <input type="button" value="Clear My Location" className="btn--clear" />
      </div>
    )
  }
}

class GeoShowInformations extends React.Component {
  render() {

    return(
      <div className="geo_show_information">
        {this.props.address}
      </div>
    )
  }
}

class GeoMapa extends React.Component {

  render() {
    const arr = this.props.directions;
    let stg = '';
    let information = '';

    arr.map(function(num, i) {
       stg += num[0] + ',' + num[1] + '&zoom=6&size=400x400&markers=color:blue|' + num[0] + ',' + num[1] + '&zoom=6&size=400x400&markers=color:blue|';
       information += 'Latitude: ' + num[0] + ' Longitude: ' + num[1];
    });

    return (
      <div className="geo__container__map">
         <GeoShowInformations address={information}/>
         <img src={'//maps.googleapis.com/maps/api/staticmap?center=' + stg} />
      </div>
    )
  }
}

export default App;
