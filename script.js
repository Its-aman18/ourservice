// Initialize Orders
if (!localStorage.getItem("orders")) {
    let initialOrders = {
        "101": "Placed",
        "102": "Shipped",
        "103": "Delivered"
    };
    localStorage.setItem("orders", JSON.stringify(initialOrders));
}

function trackOrder() {
    let id = document.getElementById("orderId").value;
    let orders = JSON.parse(localStorage.getItem("orders"));
    let status = orders[id];

    let progressBar = document.getElementById("progressBar");

    if (status) {
        document.getElementById("status").innerText =
            "Order Status: " + status;

        let progress = {
            "Placed": "25%",
            "Shipped": "50%",
            "Out for Delivery": "75%",
            "Delivered": "100%"
        };

        progressBar.style.width = progress[status];
    } else {
        document.getElementById("status").innerText =
            "Invalid Order ID";
        progressBar.style.width = "0%";
    }
}

function submitReturn() {
    let id = document.getElementById("returnOrderId").value;
    let reason = document.getElementById("reason").value;

    let returns = JSON.parse(localStorage.getItem("returns")) || [];
    returns.push({ orderId: id, reason: reason });

    localStorage.setItem("returns", JSON.stringify(returns));

    document.getElementById("returnMsg").innerText =
        "Return Request Submitted!";
}

function updateStatus() {
    let id = document.getElementById("adminOrderId").value;
    let newStatus = document.getElementById("newStatus").value;

    let orders = JSON.parse(localStorage.getItem("orders"));

    orders[id] = newStatus;
    localStorage.setItem("orders", JSON.stringify(orders));

    document.getElementById("adminMsg").innerText =
        "Status Updated Successfully!";
}