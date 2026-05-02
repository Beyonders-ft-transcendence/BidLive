import Modal from "@/components/common/Modal";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="">
      <Header />

      <Modal>
        <div className="bg-white p-6 rounded-md w-96">
          <h2 className="text-xl font-semibold mb-4">Modal Title</h2>
          <p>This is the content of the modal.</p>
        </div>
      </Modal>
     
    </div>
  );
}
