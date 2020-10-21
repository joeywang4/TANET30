import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Button, Icon, Divider, Image, Segment, Container, Grid, Table, Label } from 'semantic-ui-react';
import { BACKEND } from '../config';
import { useAPI, useWS } from '../hooks';
import '../styles/MainPage.css';

const themes = [
  ["A", "5G行動通訊與物聯網"],
  ["B", "人工智慧與大數據"],
  ["C", "網際網路與雲端技術應用"],
  ["D", "資訊安全與個人資料保護"],
  ["E", "數位創新學習與資訊軟體應用"],
  ["F", "前瞻基礎建設與TANet 30"]
];

const MainPage = () => {
  const { token, id: userId, group: userGroup } = useSelector(state => state.user);
  const [checkState, check] = useAPI("json");
  const [paperRank, getPaperRank] = useAPI("json");
  const [richRank, getRichRank] = useAPI("json");
  const [list, getList] = useAPI("json");
  let listTime = null;
  let namelist = <span>None</span>;
  const newPaperRank = useWS("new-paper-rank");
  const newRichRank = useWS("new-rich-rank");
  const checkAmount = () => {
    check(
      BACKEND + "/ticket/avail",
      "GET",
      null,
      { 'authorization': token }
    )
  }
  const meatAmount = checkState.success?checkState.response.meat:"";
  const veganAmount = checkState.success?checkState.response.vegan:"";
  
  if (checkState.isInit()) checkAmount();
  if (paperRank.isInit())  getPaperRank(BACKEND + "/rank/paper", "GET");
  if (richRank.isInit())   getRichRank(BACKEND + "/rank/rich", "GET");
  if(list.isInit()) {
    getList(
        BACKEND + "/event/namelist",
        "GET",
        null,
        { 'authorization': token, 'content-type': "application/json" }
    );
  }
  if (list.success) {
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

  const [rankLength, richLength] = [5, 10];
  const paperRanks = themes.map(([key, title]) => (
    <Segment key={key}>
      <Grid.Row className="rank-title">
        <Header as='h3'>
          <Icon name='trophy' />
          {title}
        </Header>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <Table striped basic='very' className="rank-table">
          <Table.Body>
            {
              paperRank.success || newPaperRank ? 
                (newPaperRank?newPaperRank:paperRank.response)[key].slice(0, rankLength).map((paper, idx) => (
                  <Table.Row key={`${key}-${idx}`}>
                    <Table.Cell>{idx+1}</Table.Cell>
                    <Table.Cell className="rank-author">{paper.authors}</Table.Cell>
                    <Table.Cell>{paper.title}</Table.Cell>
                  </Table.Row>
                ))
              :
                Array.apply(undefined, Array(rankLength)).map((_, idx) => (
                  <Table.Row key={`${key}-${idx}`}>
                    <Table.Cell>{paperRank.error?"Error...":"Loading..."}</Table.Cell>
                  </Table.Row>
                ))
            }
          </Table.Body>
        </Table>
      </Grid.Row>
    </Segment>
  ))
  let richRanks = (
    <Table.Row>
      <Table.Cell>
        {richRank.error?"Error...":"Loading..."}
      </Table.Cell>
    </Table.Row>
  );
  let [userRank, userAmount] = ["?", 0];
  if (richRank.success || newRichRank) {
    const data = newRichRank?newRichRank:richRank.response;
    richRanks = data.slice(0, richLength).map((person, idx) => (
      <Table.Row key={person.name}>
        <Table.Cell>{idx+1}</Table.Cell>
        <Table.Cell>{person.name}</Table.Cell>
        <Table.Cell>${person.amount}</Table.Cell>
      </Table.Row>
    ));
    if (userId && userGroup === 'user') {
      const recordIdx = data.findIndex(record => record.id === userId);
      if (recordIdx >= 0) {
        userRank = recordIdx+1;
        userAmount = data[recordIdx].amount;
      }
    }
  }

  return (
    <div>
      <Image src="banner.png" />
      <Container>
        <Segment style={{ marginTop: "3em" }}>
          <Grid className="message" divided>
            <Grid.Column color='blue' width={2} style={{ textAlign: "center", fontSize: "1.1em" }}>
              <Icon name="bell" />
              便當數量
            </Grid.Column>
            <Grid.Column width={2} >
              Meat
            </Grid.Column>
            <Grid.Column width={1} className="number">
              {checkState.error?"Error":meatAmount}
            </Grid.Column>
            <Grid.Column width={2} >
              Vegan
            </Grid.Column>
            <Grid.Column width={1} className="number">
              {checkState.error?"Error":veganAmount}
            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column floated="right" width={2} style={{ paddingBottom: "0.4em", paddingTop: "0.4em" }}>
              <Button animated color='teal' onClick={checkAmount}>
                <Button.Content visible>Refresh</Button.Content>
                <Button.Content hidden>
                  <Icon name='refresh' />
                </Button.Content>
              </Button>
            </Grid.Column>
          </Grid>
        </Segment>
      </Container>

      <Container style={{ marginTop: '3em', marginBottom: '3em' }}>
        <Grid stackable>
          <Grid.Column width={10}>
            {paperRanks}
          </Grid.Column>

          <Grid.Column width={6}>
            <Segment>
              <Grid.Row className="rank-title">
                <Header as='h3'>
                  <Icon name='chess queen' />
                  Monopoly
                </Header>
              </Grid.Row>
              <Divider>
              </Divider>
              <Grid.Row style={{ paddingLeft: "1em" }}>
                <Table basic='very' className="rank-table">
                  <Table.Body>
                    {richRanks}
                  </Table.Body>
                  {
                    userId && userGroup === 'user' ?
                    <Table.Footer>
                      <Table.Row>
                        <Table.HeaderCell>
                          <Label ribbon>
                            {userRank}
                          </Label>
                        </Table.HeaderCell>
                        <Table.HeaderCell style={{fontWeight: "bold"}}>
                          YOU
                        </Table.HeaderCell>
                        <Table.HeaderCell style={{fontWeight: "bold"}}>
                          ${userAmount}
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Footer>
                    : null
                  }
                </Table>
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