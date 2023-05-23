import React, { useState } from 'react'
import { Box, Tooltip, Button, Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast } from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios'
import { appConfig } from '../../configs/urlconfig';
import ChatLoading from '../helper/ChatLoading';
import UserListItem from '../userSpecific/UserListItem';


const SideDrawer = () => {
      const [search, setSearch] = useState('');
      const [searchResult, setSearchResult] = useState([]);
      const [loading, setLoading] = useState(false);
      const [loadingChat, setLoadingChat] = useState();

      const { user, setSelectedChat, chats, setChats } = ChatState();
      const history = useHistory();
      const { isOpen, onOpen, onClose } = useDisclosure();
      const toast = useToast();

      const logoutHandler = () => {
            localStorage.removeItem('userInfo');
            history.push('/');
      };

      const handleSearch = async () => {
            if (!search) {
                  toast({
                        title: 'Please enter something in search',
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                        position: "top-left"
                  });
                  return;
            }
            try {
                  setLoading(true);

                  const config = {
                        headers: {
                              'x-auth-key': user.data.token
                        }
                  };
                  const { data } = await axios.get(`${appConfig.API_URL}/user/getUser?search=${search}`, config);
                  setLoading(false);
                  setSearchResult(data);

            } catch (error) {
                  toast({
                        title: 'Error Occured',
                        description: 'failed to load result',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom-left'
                  });
            }
      }           

      const accessChat = async (userId) => {
            try {
                  setLoadingChat(true)
                  const config = {
                        headers: {
                              'Content-type': 'application/json',
                              'x-auth-key': user.data.token
                        }
                  };
                  const { data } = await axios.post(`${appConfig.API_URL}/chat/createChat`, { userId }, config);

                  if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
                      
                  setSelectedChat(data);
                  setLoadingChat(false);
                  onClose();

            } catch (error) {
                  toast({
                        title: 'Error Occured',
                        description: error.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom-left'
                  });
            }
      }


      return (
            <>
                  <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        bg="white"
                        w="100%"
                        p="5px 10px 5px 10px"
                        borderWidth="5px"
                  >
                        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
                              <Button variant="ghost" onClick={onOpen}>
                                    <i className='fas fa-search'></i>
                                    <Text d={{ base: 'none', md: "flex" }} px={4}>
                                          Search User
                                    </Text>
                              </Button>
                        </Tooltip>

                        <Text fontSize='2xl' fontFamily='Work sans'>
                              ©️hit❤️©️hat
                        </Text>
                        <div>
                              <Menu>
                                    <MenuButton p={1}>
                                          <BellIcon fontSize="2xl" m={1} />
                                    </MenuButton>
                              </Menu>
                              <Menu>
                                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                          <Avatar
                                                size='sm'
                                                cursor='pointer'
                                                name={user.data.name}
                                                src={user.data.picture} />
                                    </MenuButton>
                                    <MenuList>
                                          <ProfileModal user={user}>
                                                <MenuItem>Profile</MenuItem>
                                          </ProfileModal>
                                          <MenuDivider />
                                          <MenuItem color='red' onClick={logoutHandler}>Logout</MenuItem>
                                    </MenuList>
                              </Menu>
                        </div>
                  </Box>
                  <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                        <DrawerOverlay />
                        <DrawerContent>
                              <DrawerHeader borderBottomWidth='1px'>Search Users</DrawerHeader>
                              <DrawerBody>
                                    <Box display='flex' pb={2}>
                                          <Input
                                                placeholder='Search by name'
                                                mr={2}
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                          />
                                          <Button onClick={handleSearch}>Go</Button>
                                    </Box>
                                    {loading ? (

                                          <ChatLoading />
                                    ) : (
                                          searchResult?.map((user) => (
                                                <UserListItem
                                                      key={user._id}
                                                      user={user}
                                                      handleFunction={() => accessChat(user._id)}
                                                />
                                          ))
                                    )}
                                    {loadingChat}
                              </DrawerBody>
                        </DrawerContent>
                  </Drawer>
            </>
      )
}

export default SideDrawer
