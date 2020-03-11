import React, { Component } from 'react';
import { Menu, CardGroup, Loader, Header, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { EventLink } from '../../components';
import { BACKEND } from '../../config';

const [ERROR, SUCCESS, LOADING] = [0, 1, 2];

const mapStateToProps = (state) => ({
  id: state.user.id
})

const inArray = (array, data) => array.find(element => element === data) !== undefined;

class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: 'All',
      status: LOADING
    }
    this.events = [];
    this.getEvents();
  }

  handleItemClick = (_, { name }) => this.setState({ activeItem: name })

  filterEvents = (events, activeItem, id) => {
    switch(activeItem) {
      case 'All':
        return events;
      case 'Your':
        return events.filter(event => event.admin === id);
      case 'Participated':
        return events.filter(event => inArray(event.participant.map(user => user._id), id));
      default:
        return events;
    }
  }

  getEvents = async () => {
    await fetch(BACKEND+"/event")
    .then(res => {
      if(res.status !== 200) {
        this.setState({status: ERROR});
      }
      else{
        return res.json();
      }
    })
    .then(data => {
      this.events = data;
      this.setState({status: SUCCESS});
    })
    .catch(err => {
      this.setState({status: ERROR});
      console.error(err);
    });
  }

  render() {
    const { activeItem } = this.state;
    const { id } = this.props;
    let display = null;
    switch(this.state.status) {
      case LOADING:
        display = (
          <Loader active>Loading</Loader>
        );
        break;
      case SUCCESS:
        display = (
          <CardGroup>
            {this.filterEvents(this.events, activeItem, id).map(event => {
              return (
                <EventLink name={event.name} id={event._id} begin={event.begin} end={event.end} key={event._id} />
              )
            })}
          </CardGroup>
        );
        break;
      case ERROR:
        display = (
          <Header icon>
            <Icon name="bug" />
            <div style={{marginTop: "2vh"}} />
            看來出了點差錯，請您再試一次。
          </Header>
        );
        break;
      default:
        display = null;
    }

    return (
      <div
        style={{
          width: "90%",
          maxWidth: "900px"
        }}
      >
        <Menu stackable>
          <Menu.Item
            name='All'
            active={activeItem === 'All'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='Your'
            active={activeItem === 'Your'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='Participated'
            active={activeItem === 'Participated'}
            onClick={this.handleItemClick}
          />
        </Menu>

        <div>
          {display}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Events);