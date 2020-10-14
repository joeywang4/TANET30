import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Header, Button, Icon, Divider, Image, Segment, Container, Grid, List, Table, Tab } from 'semantic-ui-react';
import { ErrMsg } from '../components';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

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
    const [list, getList] = useAPI("json");
    const [checkState, check] = useAPI("text");
    let listTime = null;
    let namelist = <span>None</span>;
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

    if(list.isInit()) {
        getList(
            BACKEND + "/event/namelist",
            "GET",
            null,
            { 'authorization': token, 'content-type': "application/json" }
        );
    }

    if(list.error) {
        namelist = <ErrMsg />;
    }
    else if (list.success) {
        const result = list.response;
        listTime = result.Date;
        const userslist = result.Users;
        console.log(userslist);
        userslist.map((user, index) => {
            console.log("name: "+user.name+", sector: "+user.sector+", index: "+index);
        })

        namelist = (
            userslist.map((user, index) => (
                <Table.Row>
                    <Table.Cell>{index}</Table.Cell>
                    <Table.Cell>{user.name}</Table.Cell>
                    <Table.Cell>{user.sector}</Table.Cell>
                </Table.Row>
            ))
        );
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

            <Container style={{marginBottom:"3em"}}>
                <Segment>
                    <Grid.Row style={{textAlign: 'center', paddingTop:"1em", fontFamily:"Verdana"}}>
                        <Header as='h3'>
                            <Icon name='ticket' />
                            可參加抽獎名單
                        </Header>
                    </Grid.Row>
                    <Divider horizontal style={{fontWeight: 'normal'}}>
                        更新時間：{listTime}
                    </Divider>
                    <Table striped basic='very' style={{paddingLeft:"1em", paddingRight:"1.3em", paddingBottom:"1em"}}>
                        <Table.Body style={{fontSize:"1.2em"}}>
                            <Table.Row style={{color: "gray"}}>
                                <Table.Cell>序號</Table.Cell>
                                <Table.Cell>姓名</Table.Cell>
                                <Table.Cell>所屬單位</Table.Cell>
                            </Table.Row>
                            {namelist}
                        </Table.Body>
                    </Table>
                    
                </Segment>
            </Container>
        </div>
    )
}

export default MainPage;