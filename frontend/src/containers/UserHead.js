import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Icon } from 'semantic-ui-react';

const UserHead = () => {
    const { name } = useSelector(state => state.user);

    return (
        <div>
            <Header as='h2' icon textAlign='center'>
                <Icon name='user circle' circular />
                <Header.Content>Hello, {name}!</Header.Content>
            </Header>
        </div>
    )
}

export default UserHead;