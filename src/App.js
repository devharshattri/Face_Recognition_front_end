import React from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import './App.css';

const app = new Clarifai.App({
 apiKey: '711ef0674b8345dea1baabeb34eb7b87'
});


const particlesOptions = {
  particles: {
  	number: {
  	  value: 150,
  	  density: {
  	  	enable: true,
  	  	value_area: 800,
  	  }
  	}
  }
}

class App extends React.Component {
  constructor(){
  	super();
  	this.state = {
  	  input: '',
  	  imageUrl:'',
  	  box: {},
  	  route: 'signin',
  	  isSignedIn: false,
      user:{
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
  	}
  }
  loadUser = (data) => {
    this.setState({user: {
      id:  data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  calculateFaceLocation = (data) => {
  	const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  	const image = document.getElementById('inputImage');
  	const width = Number(image.width);
  	const height = Number(image.height);
  	return {
  	  leftCol: clarifaiFace.left_col * width,
  	  topRow: clarifaiFace.top_row *height,
  	  rightCol: width - (clarifaiFace.right_col * width),
  	  bottomRow: height - (clarifaiFace.bottom_row * height)
  	}	
  }

  displayFaceBox = (box) => {
  	this.setState({box: box});
  }
  onInputChange = (event) => {
  	this.setState({input: event.target.value});
  }

  onButtonSubmit = () =>{
  	this.setState({imageUrl: this.state.input});
  	app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
  	  .then(response => {
        if(response) {
          fetch('https://enigmatic-fjord-60456.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user,{entries: count}))
        })       
        }  
        this.displayFaceBox(this.calculateFaceLocation(response))
        })// response is a bounding box
      .catch(err => console.log(err));  // there was an error
  }

  onRouteChange = (route) => {
  	if ( route === 'signout') {
  	  this.setState ({isSignedIn: false});
  	} else if (route === 'home'){
  		this.setState ({isSignedIn: true});
  	}
  	this.setState ({route: route});
  }

  render() {
  	return (
      <div className="App">
        <Particles className='particles'
         params={particlesOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
        {this.state.route === 'home'
        ?<div> 
          <div style = {{display: 'flex', justifyContent: 'flex-start'}}>
          <Logo />
          <div style = {{ justifyContent: 'flex-center'}}>
            <Rank name={this.state.user.name} entries={this.state.user.entries}/> 
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          </div>
        </div>
          <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
        </div>
        : (
        	this.state.route === 'signin'
        	?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        	:<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
      	}
        <div className="footer  bt b--black-10 black-70">
          <p className="f6 db b ttu lh-solid">Designed and created by DEVHARSH ATTRI | Contact : +91 9891111943 
          | Email: devharshattri8@gmail.com</p>
        </div>
      </div>
    );
  }  
}

export default App;