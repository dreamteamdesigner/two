import ContactsTable from "../../components/ContactsTable";
import ContactsData from "../../data/contacts.json";

const Contacts = () => {
  return (
    <>
      <ContactsTable data={ContactsData} />
    </>
  );
};

export default Contacts;
