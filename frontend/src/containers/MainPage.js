import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Icon, Divider, Image, Segment, Container, Grid, Table, Label } from 'semantic-ui-react';
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
  const [seminarRank, getSeminarRank] = useAPI("json");
  const [companyRank, getCompanyRank] = useAPI("json");
  const [gameRank, getGameRank] = useAPI("json");
  const [list, getList] = useAPI("json");
  const [checkBar, bar] = useAPI("text");
  let listTime = null;
  let namelist = null;
  let courseBar = null;
  let companyBar = null;
  const newPaperRank = useWS("new-paper-rank");
  const newRichRank = useWS("new-rich-rank");
  const newSeminarRank = useWS("new-seminar-rank");
  const newCompanyRank = useWS("new-company-rank");
  const newGameRank = useWS("new-game-rank");
  const newMealAmount = useWS("new-meal-count");
  const checkAmount = () => {
    check(
      BACKEND + "/ticket/avail",
      "GET",
      null,
      { 'authorization': token }
    )
  }
  const replace = (word, idx, char) => {
    return word.substring(0,idx) + char + word.substring(idx+1);
  }
  const meatAmount = newMealAmount?newMealAmount.meat:(checkState.success ? checkState.response.meat : "");
  const veganAmount = newMealAmount?newMealAmount.vegan:(checkState.success ? checkState.response.vegan : "");
  

  if (checkState.isInit()) checkAmount();
  if (paperRank.isInit()) getPaperRank(BACKEND + "/rank/paper", "GET");
  if (richRank.isInit()) getRichRank(BACKEND + "/rank/rich", "GET");
  if (seminarRank.isInit()) getSeminarRank(BACKEND + "/rank/seminar", "GET");
  if (companyRank.isInit()) getCompanyRank(BACKEND + "/rank/company", "GET");
  if (gameRank.isInit()) getGameRank(BACKEND + "/rank/game", "GET");
  if (checkBar.isInit()) {
    bar(
      BACKEND + "/event/thresholds",
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    )
  }
  if (list.isInit()) {
    getList(
      BACKEND + "/event/namelist",
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }
  if (list.success && checkBar.success) {
    const result = list.response;
    listTime = result.Date;
    const userslist = result.Users;
    const bars = JSON.parse(checkBar.response);
    courseBar = bars.CourseBar;
    companyBar = bars.CompanyBar;

    if(!userslist) {
      namelist = (
        <Table.Row>
        </Table.Row>
      )
    }
    else {
      namelist = (
        userslist.map((user, index, key) => (
          <Table.Row key={key}>
            <Table.Cell>{index}</Table.Cell>
            <Table.Cell>{replace(user.name, 1, "Ｏ")}</Table.Cell>
            <Table.Cell>{user.sector}</Table.Cell>
          </Table.Row>
        ))
      );
    }
  }

  const [rankLength, richLength] = [5, 10];
  const paperRanks = themes.map(([key, title]) => (
    <Segment key={key}>
      <Grid.Row className="rank-title">
        <Header as='h3'>
          <Icon name='trophy' color="yellow" />
          {title}
        </Header>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <Table striped basic='very' className="rank-table">
          <Table.Body>
            {
              paperRank.success || newPaperRank ?
                (newPaperRank ? newPaperRank : paperRank.response)[key] ?
                  (newPaperRank ? newPaperRank : paperRank.response)[key].slice(0, rankLength).map((paper, idx) => (
                    <Table.Row key={`${key}-${idx}`}>
                      <Table.Cell>{idx + 1}</Table.Cell>
                      <Table.Cell className="rank-author">{paper.authors}</Table.Cell>
                      <Table.Cell>{paper.title}</Table.Cell>
                    </Table.Row>
                  ))
                  :
                  null
                :
                Array.apply(undefined, Array(rankLength)).map((_, idx) => (
                  <Table.Row key={`${key}-${idx}`}>
                    <Table.Cell>{paperRank.error ? "Error..." : "Loading..."}</Table.Cell>
                  </Table.Row>
                ))
            }
          </Table.Body>
        </Table>
      </Grid.Row>
    </Segment>
  ))
  const defaultRank = (someRank) => (
    <Table.Row>
      <Table.Cell>
        {someRank.error ? "Error..." : "Loading..."}
      </Table.Cell>
    </Table.Row>
  );
  let richRanks = defaultRank(richRank);
  let [userRank, userAmount] = ["?", 0];
  if (richRank.success || newRichRank) {
    const data = newRichRank ? newRichRank : richRank.response;
    richRanks = data.slice(0, richLength).map((person, idx) => (
      <Table.Row key={person.name}>
        <Table.Cell>{idx + 1}</Table.Cell>
        <Table.Cell>{person.name}</Table.Cell>
        <Table.Cell>${person.amount}</Table.Cell>
      </Table.Row>
    ));
    if (userId && userGroup === 'user') {
      const recordIdx = data.findIndex(record => record.id === userId);
      if (recordIdx >= 0) {
        userRank = recordIdx + 1;
        userAmount = data[recordIdx].amount;
      }
    }
  }
  let eventRanks = [[seminarRank, newSeminarRank, "議程"], [companyRank, newCompanyRank, "攤位"], [gameRank, newGameRank, "遊戲"]]
    .map(([someRank, newRank, title]) => {
      let rows = defaultRank(someRank);
      if (someRank.success || newRank) {
        const data = newRank ? newRank : someRank.response;
        rows = data.slice(0, rankLength).map((event, idx) => (
          <Table.Row key={`${title}-${idx}`}>
            <Table.Cell width={12}>{event.name}</Table.Cell>
            <Table.Cell width={4} textAlign="right">{event.participant}人</Table.Cell>
          </Table.Row>
        ));
      }
      return (
        <Segment key={title}>
          <Grid.Row className="rank-title">
            <Header as='h3'>
              <Icon name='fire' color='red' />
                最熱門{title}
            </Header>
          </Grid.Row>
          <Divider>
          </Divider>
          <Grid.Row style={{ paddingLeft: "1em" }}>
            <Table basic='very' className="rank-table">
              <Table.Body>
                {rows}
              </Table.Body>
            </Table>
          </Grid.Row>
        </Segment>
      )
    })

  return (
    <div>
      <Image src="banner.png" />
      <Container style={{ marginTop: '3em', marginBottom: '3em' }}>
        <Grid stackable>
          <Grid.Column width={10}>
            {paperRanks}
          </Grid.Column>

          <Grid.Column width={6}>
            <Segment>
              <Grid.Row className="rank-title">
                <Header as='h3'>
                  <Icon name="food" color="orange" />
                  便當數量
                </Header>
              </Grid.Row>
              <Divider style={{ margin: "1em 0 0 0" }} />
              <Grid.Row style={{ padding: "0 1em" }}>
                <Table basic='very' unstackable>
                  <Table.Body style={{fontSize: "1.2em"}}>
                    <Table.Row>
                      <Table.Cell width={11}>葷食</Table.Cell>
                      <Table.Cell width={5} textAlign="right">{checkState.error ? "Error" : meatAmount}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell width={11}>素食</Table.Cell>
                      <Table.Cell width={5} textAlign="right">{checkState.error ? "Error" : veganAmount}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Grid.Row>
            </Segment>
            <Segment>
              <Grid.Row className="rank-title">
                <Header as='h3'>
                  <Icon name='chess queen' color="yellow" />
                  大富翁
                </Header>
              </Grid.Row>
              <Divider>
              </Divider>
              <Grid.Row style={{ paddingLeft: "1em" }}>
                <Table basic='very' className="rank-table" unstackable>
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
                          <Table.HeaderCell style={{ fontWeight: "bold" }}>
                            YOU
                        </Table.HeaderCell>
                          <Table.HeaderCell style={{ fontWeight: "bold" }}>
                            ${userAmount}
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Footer>
                      : null
                  }
                </Table>
              </Grid.Row>
            </Segment>
            {eventRanks}
          </Grid.Column>
        </Grid>
      </Container>

      <Container style={{ marginBottom: "3em" }}>
        <Segment>
          <Grid.Row style={{ textAlign: 'center', paddingTop: "1em", fontFamily: "Verdana" }}>
            <Header as='h3'>
              <Icon name='ticket' />
              可參加抽獎名單
            </Header>
          </Grid.Row>
          <Divider horizontal style={{ fontWeight: 'normal' }}>
            更新時間：{listTime}
            <br />
            <br />
            抽獎資格： 議程(不同時段)數：{courseBar}， 廠商攤位：{companyBar} 
          </Divider>
          <Table striped basic='very' style={{ paddingLeft: "1em", paddingRight: "1.3em", paddingBottom: "1em" }}>
            <Table.Body style={{ fontSize: "1.2em" }}>
              <Table.Row style={{ color: "gray" }}>
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