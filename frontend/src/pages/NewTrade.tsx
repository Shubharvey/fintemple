import React from "react";
import { useNavigate } from "react-router-dom";
import TradeForm from "../components/Trades/TradeForm";

const NewTrade: React.FC = () => {
  const navigate = useNavigate();

  const handleTradeAdded = () => {
    // Navigate back to dashboard after successful trade creation
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="p-6">
      <TradeForm onTradeAdded={handleTradeAdded} onCancel={handleCancel} />
    </div>
  );
};

export default NewTrade;
