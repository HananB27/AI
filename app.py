import tkinter as tk
from tkinter import ttk, messagebox
import numpy as np
import pandas as pd
from task_model import TaskDurationModel
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from itertools import combinations_with_replacement

class TaskTeamOptimizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Task & Team Optimizer")
        self.root.geometry("900x700")
        self.root.resizable(True, True)
        
        # Load the model
        self.model = TaskDurationModel()
        try:
            self.model.load("models/model_weights.npz")
            self.model_loaded = True
        except:
            self.model_loaded = False
            messagebox.showwarning("Model Loading Error", 
                                  "Could not load model. Some features will be disabled.")
        
        # Constants
        self.experience_map = {
            "Junior": 1.5,
            "Mid": 3.25,
            "Senior": 5.75,
            "Tech Lead": 7.75
        }
        
        self.levels = ["Junior", "Mid", "Senior", "Tech Lead"]
        
        # Create single tab interface
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Initialize the interface
        self._init_task_tab()
    
    def _init_task_tab(self):
        # Create left and right frames
        left_frame = ttk.LabelFrame(self.main_frame, text="Task Configuration")
        left_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        
        right_frame = ttk.LabelFrame(self.main_frame, text="Results")
        right_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
        
        self.main_frame.columnconfigure(0, weight=3)
        self.main_frame.columnconfigure(1, weight=2)
        self.main_frame.rowconfigure(0, weight=1)
        
        # Task input fields
        self.task_inputs = {}
        
        row = 0
        # Task type
        ttk.Label(left_frame, text="Task Type:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["task_type"] = ttk.Combobox(left_frame, values=["Feature Dev", "Bug Fix", "Research", "Refactoring"])
        self.task_inputs["task_type"].grid(row=row, column=1, sticky="ew", padx=5, pady=2)
        self.task_inputs["task_type"].current(0)
        row += 1
        
        # Complexity
        ttk.Label(left_frame, text="Complexity:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["complexity"] = ttk.Combobox(left_frame, values=["Low", "Medium", "High"])
        self.task_inputs["complexity"].grid(row=row, column=1, sticky="ew", padx=5, pady=2)
        self.task_inputs["complexity"].current(1)
        row += 1
        
        # Assignee level
        ttk.Label(left_frame, text="Assignee Level:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["assignee_level"] = ttk.Combobox(left_frame, values=["Junior", "Mid", "Senior", "Tech Lead"])
        self.task_inputs["assignee_level"].grid(row=row, column=1, sticky="ew", padx=5, pady=2)
        self.task_inputs["assignee_level"].current(1)
        row += 1
        
        # Tech stack
        ttk.Label(left_frame, text="Tech Stack:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["tech_stack"] = ttk.Combobox(left_frame, values=["Python", "JavaScript", "Java", "C#", "Go", "Other"])
        self.task_inputs["tech_stack"].grid(row=row, column=1, sticky="ew", padx=5, pady=2)
        self.task_inputs["tech_stack"].current(0)
        row += 1
        
        # Priority
        ttk.Label(left_frame, text="Priority:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["task_priority"] = ttk.Combobox(left_frame, values=["Low", "Medium", "High", "Critical"])
        self.task_inputs["task_priority"].grid(row=row, column=1, sticky="ew", padx=5, pady=2)
        self.task_inputs["task_priority"].current(1)
        row += 1
        
        # Story points
        ttk.Label(left_frame, text="Story Points:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["story_points"] = ttk.Spinbox(left_frame, from_=1, to=13, width=5)
        self.task_inputs["story_points"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["story_points"].delete(0, tk.END)
        self.task_inputs["story_points"].insert(0, "5")
        row += 1
        
        # Team size
        ttk.Label(left_frame, text="Team Size:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["team_size"] = ttk.Spinbox(left_frame, from_=1, to=10, width=5)
        self.task_inputs["team_size"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["team_size"].delete(0, tk.END)
        self.task_inputs["team_size"].insert(0, "4")
        row += 1
        
        # Dependencies
        ttk.Label(left_frame, text="Dependencies:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["num_dependencies"] = ttk.Spinbox(left_frame, from_=0, to=10, width=5)
        self.task_inputs["num_dependencies"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["num_dependencies"].delete(0, tk.END)
        self.task_inputs["num_dependencies"].insert(0, "2")
        row += 1
        
        # Estimated Hours
        ttk.Label(left_frame, text="Estimated Hours:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["estimated_hours"] = ttk.Spinbox(left_frame, from_=1, to=100, width=5)
        self.task_inputs["estimated_hours"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["estimated_hours"].delete(0, tk.END)
        self.task_inputs["estimated_hours"].insert(0, "16")
        row += 1
        
        # Sprint day
        ttk.Label(left_frame, text="Sprint Day:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["sprint_day"] = ttk.Spinbox(left_frame, from_=1, to=14, width=5)
        self.task_inputs["sprint_day"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["sprint_day"].delete(0, tk.END)
        self.task_inputs["sprint_day"].insert(0, "3")
        row += 1
        
        # Created hour
        ttk.Label(left_frame, text="Created Hour (0-23):").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["created_hour"] = ttk.Spinbox(left_frame, from_=0, to=23, width=5)
        self.task_inputs["created_hour"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["created_hour"].delete(0, tk.END)
        self.task_inputs["created_hour"].insert(0, "10")
        row += 1
        
        # Remote work
        ttk.Label(left_frame, text="Remote Work:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["remote_work"] = tk.BooleanVar(value=True)
        ttk.Checkbutton(left_frame, variable=self.task_inputs["remote_work"]).grid(row=row, column=1, sticky="w", padx=5, pady=2)
        row += 1
        
        # Meetings today
        ttk.Label(left_frame, text="Meetings Today:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["meetings_today"] = ttk.Spinbox(left_frame, from_=0, to=8, width=5)
        self.task_inputs["meetings_today"].grid(row=row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["meetings_today"].delete(0, tk.END)
        self.task_inputs["meetings_today"].insert(0, "2")
        row += 1
        
        # Blocker flag
        ttk.Label(left_frame, text="Blocker:").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["blocker_flag"] = tk.BooleanVar(value=False)
        ttk.Checkbutton(left_frame, variable=self.task_inputs["blocker_flag"]).grid(row=row, column=1, sticky="w", padx=5, pady=2)
        row += 1
        
        # Team composition frame
        team_frame = ttk.LabelFrame(left_frame, text="Team Composition")
        team_frame.grid(row=row, column=0, columnspan=2, padx=5, pady=10, sticky="ew")
        row += 1
        
        tc_row = 0
        # Junior count
        ttk.Label(team_frame, text="Juniors:").grid(row=tc_row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["juniors"] = ttk.Spinbox(team_frame, from_=0, to=10, width=5)
        self.task_inputs["juniors"].grid(row=tc_row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["juniors"].delete(0, tk.END)
        self.task_inputs["juniors"].insert(0, "1")
        tc_row += 1
        
        # Mid count
        ttk.Label(team_frame, text="Mediors:").grid(row=tc_row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["mediors"] = ttk.Spinbox(team_frame, from_=0, to=10, width=5)
        self.task_inputs["mediors"].grid(row=tc_row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["mediors"].delete(0, tk.END)
        self.task_inputs["mediors"].insert(0, "2")
        tc_row += 1
        
        # Senior count
        ttk.Label(team_frame, text="Seniors:").grid(row=tc_row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["seniors"] = ttk.Spinbox(team_frame, from_=0, to=10, width=5)
        self.task_inputs["seniors"].grid(row=tc_row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["seniors"].delete(0, tk.END)
        self.task_inputs["seniors"].insert(0, "1")
        tc_row += 1
        
        # Tech lead count
        ttk.Label(team_frame, text="Tech Leads:").grid(row=tc_row, column=0, sticky="w", padx=5, pady=2)
        self.task_inputs["tech_leads"] = ttk.Spinbox(team_frame, from_=0, to=2, width=5)
        self.task_inputs["tech_leads"].grid(row=tc_row, column=1, sticky="w", padx=5, pady=2)
        self.task_inputs["tech_leads"].delete(0, tk.END)
        self.task_inputs["tech_leads"].insert(0, "0")
        tc_row += 1
        
        # Avg experience (calculated)
        ttk.Label(team_frame, text="Avg. Experience:").grid(row=tc_row, column=0, sticky="w", padx=5, pady=2)
        self.avg_exp_display = ttk.Label(team_frame, text="3.0")
        self.avg_exp_display.grid(row=tc_row, column=1, sticky="w", padx=5, pady=2)
        
        # Update avg experience when team composition changes
        for field in ["juniors", "mediors", "seniors", "tech_leads"]:
            self.task_inputs[field].config(command=self.update_avg_experience)
        
        # Optimization options frame
        opt_frame = ttk.LabelFrame(left_frame, text="Optimization Options")
        opt_frame.grid(row=row, column=0, columnspan=2, padx=5, pady=10, sticky="ew")
        row += 1
        
        opt_row = 0
        # Min team size
        ttk.Label(opt_frame, text="Min Team Size:").grid(row=opt_row, column=0, sticky="w", padx=5, pady=2)
        self.min_team_size = ttk.Spinbox(opt_frame, from_=1, to=10, width=5)
        self.min_team_size.grid(row=opt_row, column=1, sticky="w", padx=5, pady=2)
        self.min_team_size.delete(0, tk.END)
        self.min_team_size.insert(0, "2")
        
        # Max team size
        ttk.Label(opt_frame, text="Max Team Size:").grid(row=opt_row, column=2, sticky="w", padx=5, pady=2)
        self.max_team_size = ttk.Spinbox(opt_frame, from_=1, to=10, width=5)
        self.max_team_size.grid(row=opt_row, column=3, sticky="w", padx=5, pady=2)
        self.max_team_size.delete(0, tk.END)
        self.max_team_size.insert(0, "5")
        
        # Buttons frame
        buttons_frame = ttk.Frame(left_frame)
        buttons_frame.grid(row=row, column=0, columnspan=2, pady=15)
        row += 1
        
        # Predict button
        ttk.Button(buttons_frame, text="Predict Task Duration", command=self.predict_task).pack(side=tk.LEFT, padx=5)
        
        # Optimize button
        ttk.Button(buttons_frame, text="Optimize Team", command=self.optimize_team).pack(side=tk.LEFT, padx=5)

        # Clear button
        ttk.Button(buttons_frame, text="Clear Results", command=self.clear_results_and_graph).pack(side=tk.LEFT, padx=5)

        
        # Results display
        self.results_text = tk.Text(right_frame, wrap=tk.WORD, height=20, width=50)
        self.results_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.results_text.config(state=tk.DISABLED)
        
        # Figure for visualization
        self.fig_frame = ttk.Frame(right_frame)
        self.fig_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    
    def update_avg_experience(self):
        try:
            juniors = int(self.task_inputs["juniors"].get())
            mediors = int(self.task_inputs["mediors"].get())
            seniors = int(self.task_inputs["seniors"].get())
            tech_leads = int(self.task_inputs["tech_leads"].get())
            
            total_members = juniors + mediors + seniors + tech_leads
            if total_members == 0:
                avg_exp = 0
            else:
                exp_sum = (juniors * self.experience_map["Junior"] + 
                          mediors * self.experience_map["Mid"] + 
                          seniors * self.experience_map["Senior"] + 
                          tech_leads * self.experience_map["Tech Lead"])
                avg_exp = exp_sum / total_members
            
            self.avg_exp_display.config(text=f"{avg_exp:.2f}")
        except:
            self.avg_exp_display.config(text="Error")
    
    def get_task_input_data(self):
        task_data = {}
        
        # Process all inputs
        for key, widget in self.task_inputs.items():
            if isinstance(widget, (ttk.Combobox, ttk.Spinbox)):
                if key in ["story_points", "team_size", "num_dependencies", "estimated_hours", 
                          "sprint_day", "created_hour", "meetings_today", "juniors", 
                          "mediors", "seniors", "tech_leads"]:
                    try:
                        task_data[key] = int(widget.get())
                    except:
                        messagebox.showerror("Input Error", f"Invalid value for {key}")
                        return None
                else:
                    task_data[key] = widget.get()
            elif isinstance(widget, tk.BooleanVar):
                task_data[key] = widget.get()
        
        # Calculate average experience
        task_data["assignee_level"] = self.task_inputs["assignee_level"].get()
        
        # Calculate team size from composition
        team_size = (task_data["juniors"] + task_data["mediors"] + 
                     task_data["seniors"] + task_data["tech_leads"])
        
        # Validate team size matches input
        if team_size != task_data["team_size"]:
            task_data["team_size"] = team_size
        
        # Calculate average experience
        if team_size > 0:
            avg_exp = ((task_data["juniors"] * self.experience_map["Junior"] +
                      task_data["mediors"] * self.experience_map["Mid"] +
                      task_data["seniors"] * self.experience_map["Senior"] +
                      task_data["tech_leads"] * self.experience_map["Tech Lead"]) / team_size)
            task_data["avg_experience"] = round(avg_exp, 2)
        else:
            task_data["avg_experience"] = 0
        
        return task_data
    
    def predict_task(self):
        if not self.model_loaded:
            messagebox.showerror("Model Error", "Model not loaded. Cannot predict.")
            return
        
        task_data = self.get_task_input_data()
        if task_data is None:
            return
        
        try:
            prediction = self.model.predict(task_data)
            days = int(prediction)
            hours = round((prediction - days) * 24)
            
            # Update results
            self.results_text.config(state=tk.NORMAL)
            self.results_text.delete(1.0, tk.END)
            self.results_text.insert(tk.END, f"Predicted Duration: {days} days and {hours} hours\n\n")
            self.results_text.insert(tk.END, f"Task: {task_data['task_type']}\n")
            self.results_text.insert(tk.END, f"Complexity: {task_data['complexity']}\n")
            self.results_text.insert(tk.END, f"Priority: {task_data['task_priority']}\n")
            self.results_text.insert(tk.END, f"Story Points: {task_data['story_points']}\n\n")
            
            self.results_text.insert(tk.END, f"Team Size: {task_data['team_size']}\n")
            self.results_text.insert(tk.END, f"Team Composition:\n")
            self.results_text.insert(tk.END, f"  Juniors: {task_data['juniors']}\n")
            self.results_text.insert(tk.END, f"  Mediors: {task_data['mediors']}\n")
            self.results_text.insert(tk.END, f"  Seniors: {task_data['seniors']}\n")
            self.results_text.insert(tk.END, f"  Tech Leads: {task_data['tech_leads']}\n")
            self.results_text.insert(tk.END, f"  Avg Experience: {task_data['avg_experience']:.2f}\n")
            self.results_text.config(state=tk.DISABLED)
            
        except Exception as e:
            messagebox.showerror("Prediction Error", f"Error predicting task duration: {str(e)}")
    
    def optimize_team(self):
        if not self.model_loaded:
            messagebox.showerror("Model Error", "Model not loaded. Cannot optimize.")
            return
        
        task_data = self.get_task_input_data()
        if task_data is None:
            return
        
        try:
            min_team_size = int(self.min_team_size.get())
            max_team_size = int(self.max_team_size.get())
        except ValueError:
            messagebox.showerror("Input Error", "Invalid team size values")
            return
        
        if min_team_size > max_team_size:
            messagebox.showerror("Input Error", "Min team size cannot be greater than max team size")
            return
        
        # Clear previous figure
        for widget in self.fig_frame.winfo_children():
            widget.destroy()
        
        # Results storage
        results = []
        
        # Try different team compositions
        for team_size in range(min_team_size, max_team_size + 1):
            # Generate all possible team compositions for this size
            compositions = self.generate_team_compositions(team_size)
            
            for comp in compositions:
                # Unpack the composition
                juniors, mediors, seniors, tech_leads = comp
                
                # Skip invalid compositions
                if juniors + mediors + seniors + tech_leads != team_size:
                    continue
                
                # Calculate average experience
                avg_exp = ((juniors * self.experience_map["Junior"] +
                          mediors * self.experience_map["Mid"] +
                          seniors * self.experience_map["Senior"] +
                          tech_leads * self.experience_map["Tech Lead"]) / team_size)
                
                # Create a copy of task data for this prediction
                curr_task_data = task_data.copy()
                curr_task_data["team_size"] = team_size
                curr_task_data["juniors"] = juniors
                curr_task_data["mediors"] = mediors
                curr_task_data["seniors"] = seniors
                curr_task_data["tech_leads"] = tech_leads
                curr_task_data["avg_experience"] = round(avg_exp, 2)
                
                # Make prediction
                prediction = self.model.predict(curr_task_data)
                
                # Calculate cost based on experience levels
                cost = (juniors * self.experience_map["Junior"] * 50 +
                       mediors * self.experience_map["Mid"] * 75 +
                       seniors * self.experience_map["Senior"] * 100 +
                       tech_leads * self.experience_map["Tech Lead"] * 125) * prediction
                
                # Store result
                days = int(prediction)
                hours = round((prediction - days) * 24)
                results.append({
                    "juniors": juniors,
                    "mediors": mediors,
                    "seniors": seniors,
                    "tech_leads": tech_leads,
                    "team_size": team_size,
                    "avg_experience": round(avg_exp, 2),
                    "prediction": prediction,
                    "days": days,
                    "hours": hours,
                    "cost": round(cost, 2)
                })
        
        # Sort results by prediction time (ascending)
        results.sort(key=lambda x: x["prediction"])
        
        # Display top 5 fastest teams
        self.results_text.config(state=tk.NORMAL)
        self.results_text.delete(1.0, tk.END)
        self.results_text.insert(tk.END, "Top 5 Fastest Teams:\n\n")
        
        for i, result in enumerate(results[:5]):
            self.results_text.insert(tk.END, f"{i+1}. Team of {result['team_size']} members:\n")
            self.results_text.insert(tk.END, f"   {result['juniors']} Juniors, {result['mediors']} Mediors, ")
            self.results_text.insert(tk.END, f"{result['seniors']} Seniors, {result['tech_leads']} Tech Leads\n")
            self.results_text.insert(tk.END, f"   Avg Experience: {result['avg_experience']:.2f}\n")
            self.results_text.insert(tk.END, f"   Duration: {result['days']} days and {result['hours']} hours\n")
            self.results_text.insert(tk.END, f"   Cost: ${result['cost']:,.2f}\n\n")
        
        # Sort results by cost (ascending)
        results.sort(key=lambda x: x["cost"])
        
        self.results_text.insert(tk.END, "Top 5 Most Cost-Effective Teams:\n\n")
        
        for i, result in enumerate(results[:5]):
            self.results_text.insert(tk.END, f"{i+1}. Team of {result['team_size']} members:\n")
            self.results_text.insert(tk.END, f"   {result['juniors']} Juniors, {result['mediors']} Mediors, ")
            self.results_text.insert(tk.END, f"{result['seniors']} Seniors, {result['tech_leads']} Tech Leads\n")
            self.results_text.insert(tk.END, f"   Avg Experience: {result['avg_experience']:.2f}\n")
            self.results_text.insert(tk.END, f"   Duration: {result['days']} days and {result['hours']} hours\n")
            self.results_text.insert(tk.END, f"   Cost: ${result['cost']:,.2f}\n\n")
        
        self.results_text.config(state=tk.DISABLED)
        
        # Create visualization
        self.create_optimization_chart(results)
    
    def generate_team_compositions(self, team_size):
        """Generate all possible team compositions for a given team size"""
        compositions = []
        
        # Generate all combinations with replacement
        for composition in combinations_with_replacement(range(4), team_size):
            # Count occurrences of each level
            counts = [0, 0, 0, 0]  # juniors, mediors, seniors, tech_leads
            for level in composition:
                counts[level] += 1
            
            compositions.append(tuple(counts))
        
        # Remove duplicates
        return list(set(compositions))
    
    def create_optimization_chart(self, results):
        """Create scatter plot of team compositions"""
        # Create matplotlib figure
        fig, ax = plt.subplots(figsize=(6, 4))
        
        # Extract data for plotting
        avg_experiences = [r["avg_experience"] for r in results]
        durations = [r["prediction"] for r in results]
        costs = [r["cost"] for r in results]
        team_sizes = [r["team_size"] for r in results]
        
        # Create scatter plot
        scatter = ax.scatter(avg_experiences, durations, c=costs, s=[ts*15 for ts in team_sizes], 
                            alpha=0.6, cmap='viridis')
        
        # Add colorbar
        cbar = fig.colorbar(scatter)
        cbar.set_label('Cost ($)')
        
        # Set labels and title
        ax.set_xlabel('Average Team Experience')
        ax.set_ylabel('Duration (days)')
        ax.set_title('Team Composition Optimization')
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        # Create canvas
        canvas = FigureCanvasTkAgg(fig, master=self.fig_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
    def clear_results_and_graph(self):
        self.results_text.config(state=tk.NORMAL)
        self.results_text.delete(1.0, tk.END)
        self.results_text.config(state=tk.DISABLED)
        for widget in self.fig_frame.winfo_children():
            widget.destroy()


    def run(self):
        self.root.mainloop()
    
if __name__ == "__main__":
    root = tk.Tk()
    app = TaskTeamOptimizerApp(root)
    app.run()