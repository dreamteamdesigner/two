import whatsappChats from "../../../data/chats/whatsappChats.json";
import instagramChats from "../../../data/chats/instagramChats.json";
import facebookChats from "../../../data/chats/facebookChats.json";

const chatPlatforms = {
  whatsapp: {
    name: "WhatsApp",
    data: whatsappChats,
  },

  instagram: {
    name: "Instagram",
    data: instagramChats,
  },

  facebook: {
    name: "Facebook",
    data: facebookChats,
  },
};

export default chatPlatforms;
