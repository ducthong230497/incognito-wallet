import React from 'react';
import { View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import routeNames from '@src/router/routeNames';
import { userIdSelector } from '@screens/Profile';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity } from '@src/components/core';
import { BtnDelete } from '@src/components/Button';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import Icons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { actionReadNews, actionRemoveNews } from './News.actions';
import { listNewsStyled as styled } from './News.styled';
import { TYPE } from './News.constant';

const ListNews = ({ listNews, type, lastNewsID }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = useSelector(userIdSelector);  
  
  const handleRemoveNews = (id) => dispatch(actionRemoveNews(id));

  const onPressItem = ({ item, canTap }) => {

    dispatch(actionReadNews(item?.id));
    
    if (canTap) {        

      // reset all highlight:
      navigation.setParams({ 'lastNewsID': 0 });

      navigation.navigate(routeNames.Community, {
        uri: item?.more,
      });
    }
  };

  const Item = React.memo((props) => {

    const { item, firstChild } = props;
    const { id, icon, title, description, createdAt } = item;
    const canTap = !!item?.more;

    // check show highlight or no:
    const isHighlight = lastNewsID > 1 && lastNewsID < id;
    
    const TapItem = (props) => {
      const { animated = true } = props;
      if (!animated) {
        return (
          <TouchableWithoutFeedback
            onPress={() => onPressItem({ item, canTap })}
          >
            {props?.children}
          </TouchableWithoutFeedback>
        );
      }
      return (
        <TouchableOpacity onPress={() => onPressItem({ item, canTap })}>
          {props?.children}
        </TouchableOpacity>
      );
    };
    let Component;
    switch (type) {
    case TYPE.news: {
      Component = () => (
        <View style={styled.extra}>
          <Text style={isHighlight ? styled.title : styled.titleHighLight}>{title?.trim()}</Text>
          <Text style={styled.date}>{moment(createdAt).format('YYYY-DD-MM HH:mm')}</Text>
          {canTap && (
            <View style={styled.descContainer}>
              <Text style={styled.desc}>{description?.trim()}</Text>
              <Icons name="chevron-right" size={16} color={COLORS.blue5} />
            </View>
          )}
        </View>
      );
      break;
    }
    // case TYPE.whatNews: {
    //   Component = () => (
    //     <View style={[styled.hook, styled.hook2, isHighlight?styled.highlights:'']}>
    //       <Image style={styled.icon} source={{ uri: icon }} />
    //       <Text style={styled.desc}>
    //         {`${title} `}{' '}
    //         {canTap && (
    //           <Text style={[styled.desc, { color: COLORS.black }]}>
    //             {`${description}`}
    //             <Icon
    //               name="chevron-thin-right"
    //               size={14}
    //               color={COLORS.black}
    //             />
    //           </Text>
    //         )}
    //       </Text>
    //     </View>
    //   );
    //   break;
    // }
    // case TYPE.whatNext: {
    //   Component = () => (
    //     <View
    //       style={[styled.hook, styled.hook3,firstChild && { marginTop: 30 }]}
    //     >
    //       <Text style={[styled.desc, styled.descNoIcon]}>
    //         {`${title} `}
    //         {canTap && (
    //           <Icon
    //             name="chevron-thin-right"
    //             size={14}
    //             color={COLORS.colorGreyBold}
    //           />
    //         )}{' '}
    //       </Text>
    //     </View>        
    //   );
    //   break;
    // }
    default: {
      return null;
    }
    }
    return (
      <TapItem animated={!!canTap}>
        <Component />
      </TapItem>
    );
  });
  const renderListNews = () => {
    return listNews.map((item, index, arr) => {
      const user = item?.listUserNews.find((item) => item?.userId === userId);
      const isRemoved = user?.isRead === -1;
      if (type === 1) {
        if (isRemoved) {
          return null;
        }
        const isRead = user?.isRead === 1;
        return (
          <Swipeout
            autoClose
            style={[
              {
                backgroundColor: 'transparent',
              },
              arr.length - 1 === index && { marginBottom: 0 },
            ]}
            right={[
              {
                component: (
                  <BtnDelete
                    showIcon={false}
                    onPress={() => handleRemoveNews(item?.id)}
                  />
                ),
              },
            ]}
          >
            <Item
              item={item}
              firstChild={index === 0}
              isRead={isRead}
              key={item?.id}
            />
          </Swipeout>
        );
      }
      return <Item {...{ item, firstChild: index === 0 }} key={item?.id} />;
    });
  };
  return <View style={styled.listNews}>{renderListNews()}</View>;
};

ListNews.propTypes = {
  listNews: PropTypes.array.isRequired,
  type: PropTypes.number.isRequired,
  lastNewsID: PropTypes.number.isRequired,
};

export default ListNews;
