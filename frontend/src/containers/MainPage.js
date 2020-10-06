import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Header, Button, Icon, Divider, Image, Segment, Container, Grid, List, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';
import { usedDate } from '../util'
const path = require("path");

const messageStyle = {
    fontSize: "1.1em", 
    fontWeight: "bold", 
    textAlign: "center"
}

const MainPage = () => {
    const { token } = useSelector(state => state.user);
    //get current mealboxes amount
    const [amountMeat, setAmountMeat] = useState(null);
    const [amountVegan, setAmountVegan] = useState(null);
    const [checkState, check] = useAPI("text");
    const checkAmount = () => {
        if(checkState.isInit()){
        check(
            BACKEND + "/ticket/avail",
            "GET",
            null,
            { 'authorization': token, 'content-type': "application/json", mode: 'cors' }
        )
        }
        if(checkState.success){
        const amounts = JSON.parse(checkState.response);
        setAmountMeat(amounts.meat);
        setAmountVegan(amounts.vegan);
        }
    }


    return (
        <div>
            <Image src="banner.png" />
            <Container>
                <Segment style={{marginTop: "3em"}}>
                    <Grid style={messageStyle} divided>
                        <Grid.Column color='blue' width={2} style={{textAlign: "center", fontSize: "1.1em"}}>
                            <Icon name="bell" />
                            便當數量
                        </Grid.Column>
                        <Grid.Column width={2} >
                            Meat
                        </Grid.Column>
                        <Grid.Column width={1} style={{fontWeight: "normal"}}>
                            {amountMeat}
                        </Grid.Column>
                        <Grid.Column width={2} >
                            Vegan
                        </Grid.Column>
                        <Grid.Column width={1} style={{fontWeight: "normal"}}>
                            {amountVegan}
                        </Grid.Column>
                        <Grid.Column>
                        </Grid.Column>
                        <Grid.Column floated="right" width={2} style={{paddingBottom:"0.4em", paddingTop:"0.4em"}}>
                            <Button animated color='teal' onClick = {checkAmount}>
                                <Button.Content visible>Refresh</Button.Content>
                                <Button.Content hidden>
                                    <Icon name = 'refresh' />
                                </Button.Content>
                            </Button>
                        </Grid.Column>
                    </Grid>
                </Segment>
            </Container>

            <Container style={{marginTop: '3em', marginBottom:'3em'}}>
                <Grid stackable>
                    <Grid.Column width={10}>
                        <Segment>
                            <Grid.Row style={{textAlign: 'center', paddingTop:"1em", fontFamily:"Verdana"}}>
                                <Header as='h3'>
                                    <Icon name='trophy' />
                                    Most Popular Author
                                </Header>
                            </Grid.Row>
                            <Divider>
                            </Divider>
                           <Grid.Row>
                               <Table striped basic='very' style={{paddingLeft:"1em", paddingRight:"1.3em", paddingBottom:"1em"}}>
                                   <Table.Body style={{fontSize:"1.2em"}}>
                                       <Table.Row>
                                           <Table.Cell>1</Table.Cell>
                                           <Table.Cell style={{fontWeight:"bold"}}>Patrick</Table.Cell>
                                           <Table.Cell>Benefits of Sleep</Table.Cell>
                                       </Table.Row>
                                       <Table.Row>
                                           <Table.Cell>2</Table.Cell>
                                           <Table.Cell style={{fontWeight:"bold"}}>SpongeBob</Table.Cell>
                                           <Table.Cell>Jellyfish Jam</Table.Cell>
                                       </Table.Row>
                                       <Table.Row>
                                           <Table.Cell>3</Table.Cell>
                                           <Table.Cell style={{fontWeight:"bold"}}>Plankton</Table.Cell>
                                           <Table.Cell>Mission Impossible</Table.Cell>
                                       </Table.Row>
                                       <Table.Row>
                                           <Table.Cell>4</Table.Cell>
                                           <Table.Cell style={{fontWeight:"bold"}}>Gary</Table.Cell>
                                           <Table.Cell>Meow</Table.Cell>
                                       </Table.Row>
                                   </Table.Body>
                               </Table>
                           </Grid.Row>
                        </Segment>
                    </Grid.Column>

                    <Grid.Column width={6}>
                        <Segment>
                            <Grid.Row style={{textAlign: 'center', paddingTop:"1em", paddingBottom:"1em", fontFamily:"Verdana"}}>
                                <Header as='h3'>
                                    <Icon name='chess queen' />
                                    Monopoly
                                </Header>
                            </Grid.Row>
                            <Divider>
                            </Divider>
                            <Grid.Row style={{paddingLeft:"1em"}}>
                            <List animated style={{fontSize:"1.2em"}}>
                                <List.Item>
                                    <List.Content>
                                        <List.Header>Helen</List.Header>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Content>
                                        <List.Header>Christian</List.Header>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Content>
                                        <List.Header>Daniel</List.Header>
                                    </List.Content>
                                </List.Item>
                            </List>
                            </Grid.Row>
                        </Segment>
                    </Grid.Column>
                </Grid>
            </Container>
        </div>
    )
}

export default MainPage;