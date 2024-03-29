import React from 'react';
import './App.css';
import 'tachyons';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';


const app = new Clarifai.App({
  apiKey: '78a8babced944f26b722fc921c7f8a32'
});

const particlesOptions = {
  particles:{
    number:{
      value:30,
      density: {
        enable:true,
        value_area:800
      }
    }
  }
}

class App extends React.Component{
  constructor(){
    super();
    this.state ={
      input:'',
      imageUrl:'',
      box: {},
      route: 'signin',
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState ({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row  * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (e) => {
    this.setState({input: e.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
     app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input )
       .then(response => {
         if(response){
            fetch('http://localhost:3001/image', {
              method: 'put',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  id: this.state.user.id,
              })         
            })
            .then(response => response.json())
            .then(count => {
              this.setState(
                Object.assign(this.state.user, {entries: count} )
              )
            })
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
        })
       .catch(err => console.log(err));
  }
  
  onRouteChange = (route) => {
    this.setState({route: route})
  }

  render(){
    //instead of having to type so many this.state, we can destructure to make the code cleaner
    return (
      <div className="App">
        <Particles className="particles"
          params={particlesOptions}
          />
        { this.state.route === 'signin' 
          ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : this.state.route === 'register'
            ? <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <div>
              <Navigation onRouteChange={this.onRouteChange} />
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
            </div>

        }        
      </div>
    );
  }

}

export default App;
