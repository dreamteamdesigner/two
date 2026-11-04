import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import { NavLink, useParams } from "react-router-dom";
import { IconArrowNarrowLeftDashed } from "@tabler/icons-react";

import chatPlatforms from "./chatPlatforms";

const ChatHistory = () => {
  const { platform, slug } = useParams();

  const currentPlatform = chatPlatforms[platform];

  const conversations = currentPlatform?.data?.conversations ?? [];

  const historyRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const name = conversation.conversation_name ?? "";
      const address = conversation.contact_address ?? "";

      return (
        name.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        (conversation.messages ?? []).some((message) =>
          (message.message ?? "").toLowerCase().includes(query),
        )
      );
    });
  }, [conversations, searchQuery]);

  const activeConversation = conversations.find(
    (conversation) => conversation.slug === slug,
  );

  const messages = activeConversation?.messages ?? [];

  useLayoutEffect(() => {
    const history = historyRef.current;

    if (history) {
      history.scrollTop = history.scrollHeight;
    }
  }, [platform, slug, messages.length]);

  // Time displayed inside chat messages.
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Dates displayed in the conversation list.
  const formatConversationDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();

    const startOfDay = (value) =>
      new Date(value.getFullYear(), value.getMonth(), value.getDate());

    const today = startOfDay(now);
    const targetDay = startOfDay(date);

    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 0) return time;

    if (diffDays === 1) return "Yesterday";

    if (diffDays >= 2 && diffDays <= 3) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "2-digit" : undefined,
    });
  };

  // Date separators inside the chat.
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!currentPlatform) {
    return (
      <section className="chat">
        <div className="empty-chat">
          <p>Platform not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`chat ${platform} ${slug ? "has-selection" : "no-selection"}`}
    >
      <div className="chat-history-widget">
        {/* Conversation list */}
        <div className="conversation-container">
          <div className="conversation-header">
            <div className="header">
              <span>{currentPlatform.name}</span>
              <div className="icon"></div>
            </div>

            <div className="search">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="conversations">
            {filteredConversations.map((conversation) => {
              const lastMessage = conversation.messages?.at(-1);

              return (
                <NavLink
                  to={`/messages/${platform}/${conversation.slug}`}
                  key={conversation.id}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <div className="icon">
                    {conversation.conversation_name?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  <div className="contents">
                    <div className="bloom">
                      <span>{conversation.conversation_name}</span>

                      <span>
                        {formatConversationDate(
                          lastMessage?.timestamp ??
                            conversation.last_message_timestamp,
                        )}
                      </span>
                    </div>

                    <div className="lom">
                      {lastMessage?.is_read === false && (
                        <div className="icon"></div>
                      )}

                      <p>
                        {lastMessage?.message ??
                          conversation.last_message ??
                          "No messages yet"}
                      </p>
                    </div>
                  </div>
                </NavLink>
              );
            })}

            {filteredConversations.length === 0 && (
              <p className="empty-conversations">No conversations found.</p>
            )}
          </div>
        </div>

        {/* Chat details */}
        <div className="chat-container">
          {activeConversation ? (
            <>
              <div className="heading">
                <div className="chat-info">
                  <NavLink
                    className="icon mobile-back"
                    to={`/messages/${platform}`}
                  >
                    <IconArrowNarrowLeftDashed
                      stroke={1.5}
                      size={16}
                      color="#a6a6a6"
                    />
                  </NavLink>

                  <div className="icon">
                    {activeConversation.conversation_name?.[0]?.toUpperCase() ??
                      "?"}
                  </div>

                  <div className="lom">
                    <span>{activeConversation.conversation_name}</span>

                    <div className="dot"></div>

                    <p>
                      {activeConversation.contact_address ??
                        (activeConversation.is_group
                          ? "Group conversation"
                          : "No contact address")}
                    </p>
                  </div>
                </div>

                <div className="info icon"></div>
              </div>

              <div className="chat-panel">
                <div className="history-box" ref={historyRef}>
                  <div className="message-list">
                    {messages.map((message, index) => {
                      const isMe = message.direction === "sent";

                      const currentDate = formatDate(message.timestamp);

                      const previousDate =
                        index > 0
                          ? formatDate(messages[index - 1].timestamp)
                          : null;

                      const nextMessage = messages[index + 1];

                      // Display time only on the last message
                      // in a consecutive burst from the same sender.
                      const isLastInBurst =
                        !nextMessage ||
                        nextMessage.direction !== message.direction ||
                        (activeConversation.is_group &&
                          nextMessage.sender_id !== message.sender_id);

                      return (
                        <React.Fragment key={message.id}>
                          {currentDate && currentDate !== previousDate && (
                            <div className="chat-date">
                              <span>{currentDate}</span>
                            </div>
                          )}

                          <div
                            className={`message-conatiner${isMe ? " me" : ""}`}
                          >
                            {!isMe && activeConversation.is_group && (
                              <div className="message-sender">
                                <div className="icon">
                                  {message.sender?.[0]?.toUpperCase() ?? "?"}
                                </div>

                                {message.sender}
                              </div>
                            )}

                            <div className="message">{message.message}</div>

                            {isLastInBurst && (
                              <span className="message-time">
                                {formatTime(message.timestamp)}
                              </span>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {messages.length === 0 && (
                      <p className="empty-messages">
                        No messages in this conversation.
                      </p>
                    )}
                  </div>
                </div>

                <div className="read-only-info">
                  <div className="icon"></div>
                  <p>Chats are read only</p>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="icon"></div>
              <p>
                {slug
                  ? "Conversation not found."
                  : "Select a conversation to view messages."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatHistory;
